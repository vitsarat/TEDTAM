import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { exportToExcel } from '../utils/exportExcel';
import { importFromExcel } from '../utils/importExcel';

export default function CustomerList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    accountnumber: '',
    principle: '',
    status: '',
    groupcode: '',
    branch: '',
    brand: '',
    model: '',
    licenseplate: '',
    resus: '',
    authorizationdate: '',
    commission: '',
    registrationid: '',
    workgroup: '',
    fieldteam: '',
    installment: '',
    initialbucket: '',
    currentbucket: '',
    cycleday: '',
    enginenumber: '',
    bluebookprice: '',
    address: '',
    latitude: '',
    longitude: '',
    hubcode: '',
    workstatus: '',
    lastvisitresult: '',
    team: '',
  });
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchCustomers() {
      let query = supabase.from('customers').select('*');
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching customers:', error.message);
        return;
      }
      setCustomers(data);
    }
    fetchCustomers();
  }, [search, filterStatus]);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await importFromExcel(file);
      const { data } = await supabase.from('customers').select('*');
      setCustomers(data || []);
    }
  };

  const handleAddCustomer = async () => {
    const customerData = {
      ...newCustomer,
      principle: parseFloat(newCustomer.principle) || 0,
      commission: parseFloat(newCustomer.commission) || 0,
      installment: parseFloat(newCustomer.installment) || 0,
      bluebookprice: parseFloat(newCustomer.bluebookprice) || 0,
      latitude: parseFloat(newCustomer.latitude) || 0,
      longitude: parseFloat(newCustomer.longitude) || 0,
    };

    const { error } = await supabase.from('customers').insert(customerData);
    if (error) {
      console.error('Error adding customer:', error.message);
      return;
    }

    const { data } = await supabase.from('customers').select('*');
    setCustomers(data || []);
    setShowForm(false);
    setNewCustomer({
      name: '',
      accountnumber: '',
      principle: '',
      status: '',
      groupcode: '',
      branch: '',
      brand: '',
      model: '',
      licenseplate: '',
      resus: '',
      authorizationdate: '',
      commission: '',
      registrationid: '',
      workgroup: '',
      fieldteam: '',
      installment: '',
      initialbucket: '',
      currentbucket: '',
      cycleday: '',
      enginenumber: '',
      bluebookprice: '',
      address: '',
      latitude: '',
      longitude: '',
      hubcode: '',
      workstatus: '',
      lastvisitresult: '',
      team: '',
    });
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1E3A8A] mb-4">Customer List</h1>
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="ค้นหาชื่อลูกค้า..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
        >
          <option value="">ทุกสถานะ</option>
          <option value="จบ">จบ</option>
          <option value="ไม่จบ">ไม่จบ</option>
        </select>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-[#F97316] text-white rounded-md hover:bg-[#E55B13] transition"
        >
          Export to Excel
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#162A6B] transition"
        >
          Import from Excel
        </button>
        <input
          type="file"
          accept=".xlsx"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImport}
        />
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#162A6B] transition"
        >
          Add Customer
        </button>
      </div>

      {showForm && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-[#1E3A8A] mb-2">Add New Customer</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Account Number"
              value={newCustomer.accountnumber}
              onChange={(e) => setNewCustomer({ ...newCustomer, accountnumber: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Principle"
              value={newCustomer.principle}
              onChange={(e) => setNewCustomer({ ...newCustomer, principle: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Status"
              value={newCustomer.status}
              onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Group Code"
              value={newCustomer.groupcode}
              onChange={(e) => setNewCustomer({ ...newCustomer, groupcode: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Branch"
              value={newCustomer.branch}
              onChange={(e) => setNewCustomer({ ...newCustomer, branch: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Brand"
              value={newCustomer.brand}
              onChange={(e) => setNewCustomer({ ...newCustomer, brand: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Model"
              value={newCustomer.model}
              onChange={(e) => setNewCustomer({ ...newCustomer, model: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="License Plate"
              value={newCustomer.licenseplate}
              onChange={(e) => setNewCustomer({ ...newCustomer, licenseplate: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Resus"
              value={newCustomer.resus}
              onChange={(e) => setNewCustomer({ ...newCustomer, resus: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Authorization Date (DD/MM/YYYY)"
              value={newCustomer.authorizationdate}
              onChange={(e) => setNewCustomer({ ...newCustomer, authorizationdate: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Commission"
              value={newCustomer.commission}
              onChange={(e) => setNewCustomer({ ...newCustomer, commission: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Registration ID"
              value={newCustomer.registrationid}
              onChange={(e) => setNewCustomer({ ...newCustomer, registrationid: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Work Group"
              value={newCustomer.workgroup}
              onChange={(e) => setNewCustomer({ ...newCustomer, workgroup: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Field Team"
              value={newCustomer.fieldteam}
              onChange={(e) => setNewCustomer({ ...newCustomer, fieldteam: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Installment"
              value={newCustomer.installment}
              onChange={(e) => setNewCustomer({ ...newCustomer, installment: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Initial Bucket"
              value={newCustomer.initialbucket}
              onChange={(e) => setNewCustomer({ ...newCustomer, initialbucket: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Current Bucket"
              value={newCustomer.currentbucket}
              onChange={(e) => setNewCustomer({ ...newCustomer, currentbucket: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Cycle Day"
              value={newCustomer.cycleday}
              onChange={(e) => setNewCustomer({ ...newCustomer, cycleday: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Engine Number"
              value={newCustomer.enginenumber}
              onChange={(e) => setNewCustomer({ ...newCustomer, enginenumber: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Blue Book Price"
              value={newCustomer.bluebookprice}
              onChange={(e) => setNewCustomer({ ...newCustomer, bluebookprice: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Address"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Latitude"
              value={newCustomer.latitude}
              onChange={(e) => setNewCustomer({ ...newCustomer, latitude: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Longitude"
              value={newCustomer.longitude}
              onChange={(e) => setNewCustomer({ ...newCustomer, longitude: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Hub Code"
              value={newCustomer.hubcode}
              onChange={(e) => setNewCustomer({ ...newCustomer, hubcode: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Work Status"
              value={newCustomer.workstatus}
              onChange={(e) => setNewCustomer({ ...newCustomer, workstatus: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Last Visit Result"
              value={newCustomer.lastvisitresult}
              onChange={(e) => setNewCustomer({ ...newCustomer, lastvisitresult: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <input
              type="text"
              placeholder="Team"
              value={newCustomer.team}
              onChange={(e) => setNewCustomer({ ...newCustomer, team: e.target.value })}
              className="p-2 border rounded-md text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAddCustomer}
              className="px-4 py-2 bg-[#F97316] text-white rounded-md hover:bg-[#E55B13] transition"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {customers.map(customer => (
          <li
            key={customer.id}
            className="p-4 bg-white rounded-lg shadow-md border-l-4 border-[#F97316] hover:bg-gray-50 transition"
          >
            <p className="text-lg font-semibold text-[#1E3A8A]">{customer.name}</p>
            <p className="text-gray-600">Account: {customer.accountnumber}</p>
            <p className="text-gray-600">Principle: {customer.principle}</p>
            <p className="text-gray-600">Status: {customer.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}