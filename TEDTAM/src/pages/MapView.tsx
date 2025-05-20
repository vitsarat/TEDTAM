import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Map as MapIcon, Navigation, Users, Target, LocateFixed, MessageCircle } from "lucide-react";
import { customerService } from "@/services/customerService";
import { toast } from "@/components/ui/use-toast";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// Custom icon for markers
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Map recenter component
const RecenterAutomatically = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
};

// Map control buttons component
const MapControls = ({ 
  onZoomIn, 
  onZoomOut, 
  onLocate 
}: { 
  onZoomIn: () => void; 
  onZoomOut: () => void; 
  onLocate: () => void; 
}) => {
  return (
    <div className="absolute right-4 top-4 space-y-2 z-[1000]">
      <Button 
        size="icon"
        variant="outline"
        className="rounded-full bg-white"
        onClick={onZoomIn}
      >
        <span className="text-xl">+</span>
      </Button>
      <Button 
        size="icon"
        variant="outline"
        className="rounded-full bg-white"
        onClick={onZoomOut}
      >
        <span className="text-xl">-</span>
      </Button>
      <Button 
        size="icon"
        variant="outline"
        className="rounded-full bg-white"
        onClick={onLocate}
      >
        <LocateFixed className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Extended Marker props interface to include icon prop
interface ExtendedMarkerProps extends L.MarkerOptions {
  icon?: L.Icon | L.DivIcon;
  position: [number, number];
  eventHandlers?: any;
  children?: React.ReactNode;
}

const MapView: React.FC = () => {
  const navigate = useNavigate();
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.7563, 100.5018]); // Bangkok default
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // Use React Query to fetch customers data
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getCustomers(),
  });

  const [selectedCustomer, setSelectedCustomer] = useState(customers[0] || null);
  const [routePlanned, setRoutePlanned] = useState(false);

  // When customers data is loaded, update selected customer
  useEffect(() => {
    if (customers.length > 0 && !selectedCustomer) {
      setSelectedCustomer(customers[0]);
    }
  }, [customers, selectedCustomer]);

  // Handle navigation using Google Maps
  const handleOpenMap = () => {
    if (selectedCustomer) {
      const { latitude, longitude } = selectedCustomer;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
      toast({
        title: "นำทางไปยังพิกัดที่เลือก",
        description: `จุดหมาย: ${selectedCustomer.name}`,
      });
      
      // Log this navigation action to database (mock)
      console.log(`Navigation started to customer: ${selectedCustomer.id}`);
      
      // Update customer status in database to indicate visit
      const updatedCustomer = customerService.updateCustomer(selectedCustomer.id, {
        workStatus: "กำลังเดินทาง"
      });
      
      if (updatedCustomer) {
        console.log("Customer status updated:", updatedCustomer.workStatus);
      }
    }
  };

  // Calculate and plan optimal route
  const handlePlanRoute = () => {
    // Sort customers by proximity to user's position
    if (userPosition) {
      const sortedCustomers = [...customers]
        .map(customer => {
          // Calculate distance using Haversine formula
          const lat1 = userPosition[0];
          const lon1 = userPosition[1];
          const lat2 = customer.latitude;
          const lon2 = customer.longitude;
          
          const R = 6371; // Radius of the earth in km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c; // Distance in km
          
          return { ...customer, distance };
        })
        .sort((a, b) => a.distance - b.distance);
        
      console.log("Planned route for customers:", sortedCustomers.map(c => c.name));
      setRoutePlanned(true);
      
      toast({
        title: "วางแผนเส้นทางสำเร็จ",
        description: `จัดเรียงลูกค้าตามระยะทางใกล้-ไกล ${sortedCustomers.length} ราย`,
      });
    } else {
      toast({
        title: "ไม่สามารถวางแผนเส้นทางได้",
        description: "โปรดอนุญาตการเข้าถึงตำแหน่งที่ตั้งก่อน",
        variant: "destructive",
      });
    }
  };

  // Share current location with others
  const handleShareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: 'ตำแหน่งปัจจุบันของฉัน',
        text: `ฉันอยู่ที่พิกัดนี้`,
        url: userPosition ? `https://www.google.com/maps?q=${userPosition[0]},${userPosition[1]}` : '',
      })
      .then(() => {
        toast({
          title: "แชร์ตำแหน่งสำเร็จ",
        });
        
        // Log share activity
        console.log("Location shared:", userPosition);
      })
      .catch((error) => {
        console.error("Error sharing:", error);
        toast({
          title: "เกิดข้อผิดพลาดในการแชร์",
          variant: "destructive",
        });
      });
    } else {
      const locationText = userPosition 
        ? `ละติจูด: ${userPosition[0]}, ลองจิจูด: ${userPosition[1]}` 
        : "ไม่สามารถระบุตำแหน่งได้";
      
      // Create temporary textarea to copy text
      const textarea = document.createElement('textarea');
      textarea.value = locationText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      toast({
        title: "คัดลอกพิกัดไปยังคลิปบอร์ดแล้ว",
        description: locationText,
      });
    }
  };

  // Select customer handler
  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setMapCenter([customer.latitude, customer.longitude]);
    
    // Log customer selection
    console.log("Selected customer:", customer.id, customer.name);
  };

  // Map zoom controls
  const handleZoomIn = () => {
    if (mapInstance) {
      const newZoom = mapInstance.getZoom() + 1;
      mapInstance.setZoom(newZoom);
      console.log("Map zoomed in to level:", newZoom);
    }
  };
  
  const handleZoomOut = () => {
    if (mapInstance) {
      const newZoom = mapInstance.getZoom() - 1;
      mapInstance.setZoom(newZoom);
      console.log("Map zoomed out to level:", newZoom);
    }
  };
  
  const handleLocateUser = () => {
    if (userPosition) {
      setMapCenter(userPosition);
      console.log("Map re-centered to user location:", userPosition);
    } else {
      toast({
        title: "ไม่สามารถระบุตำแหน่งได้",
        description: "โปรดอนุญาตการเข้าถึงตำแหน่งที่ตั้ง",
        variant: "destructive",
      });
    }
  };

  // Calculate distances between user and customers
  const customersWithDistance = React.useMemo(() => {
    if (!userPosition) return customers;
    
    return customers.map(customer => {
      // Calculate distance using Haversine formula
      const lat1 = userPosition[0];
      const lon1 = userPosition[1];
      const lat2 = customer.latitude;
      const lon2 = customer.longitude;
      
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c; // Distance in km
      
      return { ...customer, distance };
    }).sort((a, b) => a.distance - b.distance);
  }, [customers, userPosition]);
  
  // Setup marker icons
  const customerIcon = createCustomIcon('#F97316'); // Orange for customers
  const userIcon = createCustomIcon('#1E3A8A'); // Blue for user

  if (isLoading) {
    return <div className="p-4 text-center">กำลังโหลดข้อมูลแผนที่...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>;
  }

  return (
    <div className="pb-20 relative h-full">
      {/* Map container */}
      <div className="bg-gray-100 h-[calc(100vh-120px)] relative">
        <MapContainer 
          style={{ height: "100%", width: "100%" }}
          ref={(map) => {
            if (map && !mapInstance) {
              map.setView(mapCenter, 13);
              setMapInstance(map);
            }
          }}
        >
          <ZoomControl position="topright" />
          
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Customer markers */}
          {customers.map((customer) => (
            <Marker 
              key={customer.id}
              position={[customer.latitude, customer.longitude] as [number, number]}
              eventHandlers={{
                click: () => handleSelectCustomer(customer),
              }}
              {...({icon: customerIcon} as ExtendedMarkerProps)}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{customer.name}</p>
                  <p>{customer.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {customer.workStatus === "ลงพื้นที่" ? 
                      <span className="text-orange-500">● {customer.workStatus}</span> : 
                      customer.workStatus === "จบงาน" ? 
                      <span className="text-green-500">● {customer.workStatus}</span> : 
                      <span>● {customer.workStatus}</span>
                    }
                  </p>
                  <button 
                    className="mt-2 text-tedtam-blue font-semibold"
                    onClick={() => navigate(`/customer/${customer.id}`)}
                  >
                    ดูข้อมูล
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* User position marker */}
          {userPosition && (
            <Marker 
              position={userPosition}
              {...({icon: userIcon} as ExtendedMarkerProps)}
            >
              <Popup>ตำแหน่งของคุณ</Popup>
            </Marker>
          )}
          
          <RecenterAutomatically position={mapCenter} />
        </MapContainer>

        {/* Map controls */}
        <MapControls 
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onLocate={handleLocateUser}
        />
      </div>

      {/* Bottom slide-up panel */}
      <div className="fixed bottom-16 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl shadow-lg border-t border-gray-200 dark:border-gray-700 p-4 max-w-md mx-auto animate-slide-in-up z-10">
        <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
        
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold text-tedtam-blue dark:text-blue-300">ลูกค้าในพื้นที่</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => navigate('/customers')}
          >
            <Users className="h-3 w-3 mr-1" />
            <span>ทั้งหมด ({customers.length})</span>
          </Button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {customersWithDistance.slice(0, 3).map((customer, index) => (
            <Card 
              key={customer.id} 
              className={`card-shadow dark:bg-gray-700 dark:border-gray-600 ${selectedCustomer?.id === customer.id ? 'border-2 border-tedtam-orange' : ''}`}
              onClick={() => handleSelectCustomer(customer)}
            >
              <CardContent className="p-3">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-sm dark:text-white">{customer.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-300">{customer.address.substring(0, 30)}...</p>
                  </div>
                  <Button 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      handleSelectCustomer(customer);
                      handleOpenMap();
                    }}
                    className="bg-tedtam-blue hover:bg-tedtam-blue/90 dark:bg-blue-600 h-8"
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    <span className="text-xs">นำทาง</span>
                  </Button>
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-300 flex items-center">
                    <span className="bg-tedtam-orange h-2 w-2 rounded-full inline-block mr-1"></span>
                    ระยะห่าง {customer.distance ? customer.distance.toFixed(1) : (3 + index * 2).toFixed(1)} กม.
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button 
            onClick={handlePlanRoute}
            className={`${routePlanned ? 'bg-green-600 hover:bg-green-700' : 'bg-tedtam-orange hover:bg-tedtam-orange/90'} dark:bg-amber-600 flex items-center justify-center`}
          >
            <MapIcon className="h-4 w-4 mr-2" />
            <span>{routePlanned ? 'เส้นทางเสร็จสิ้น' : 'วางแผนเส้นทาง'}</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleShareLocation}
            className="flex items-center justify-center dark:text-white dark:border-gray-500"
          >
            <Target className="h-4 w-4 mr-2" />
            <span>แชร์ตำแหน่ง</span>
          </Button>
        </div>
      </div>

      {/* Chat floating button */}
      <Button
        className="fixed right-4 bottom-24 rounded-full w-12 h-12 bg-tedtam-blue hover:bg-tedtam-blue/90 dark:bg-blue-700 shadow-lg flex items-center justify-center z-20"
        size="icon"
        onClick={() => navigate('/chat')}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default MapView;