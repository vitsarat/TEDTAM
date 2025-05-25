
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Bot, Search, User, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { customerService } from "@/services/customerService";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'team' | 'ai';
  timestamp: Date;
  relatedCustomerId?: string;
}

interface CustomerSuggestion {
  id: string;
  name: string;
  accountNumber: string;
}

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'สวัสดีครับ มีอะไรให้ช่วยไหมครับ? ผมสามารถช่วยค้นหาข้อมูลลูกค้า วิเคราะห์สถานะหนี้ หรือแนะนำวิธีการติดตามได้ครับ',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState<'team' | 'ai'>('ai');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [extendedInput, setExtendedInput] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCustomerSearch = (query: string) => {
    if (query.length >= 2 && query.includes("ลูกค้า")) {
      const searchTerm = query.replace("ลูกค้า", "").trim();
      if (searchTerm.length >= 2) {
        const results = customerService.filterCustomers({ searchTerm });
        const suggestions = results.slice(0, 5).map(customer => ({
          id: customer.id,
          name: customer.name,
          accountNumber: customer.accountNumber
        }));
        setCustomerSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCustomer = (customer: CustomerSuggestion) => {
    setInputText("");
    setShowSuggestions(false);
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: `ต้องการดูข้อมูลลูกค้า ${customer.name}`,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);

    // Simulate AI response with customer data
    setTimeout(() => {
      const customerDetails = customerService.getCustomerById(customer.id);
      if (customerDetails) {
        const responseMessage: Message = {
          id: Date.now().toString(),
          text: `ข้อมูลลูกค้า: ${customer.name}\nเลขบัญชี: ${customer.accountNumber}\nสถานะ: ${customerDetails.status}\nยอดหนี้: ${customerDetails.principle.toLocaleString()} บาท\nจำนวนงวด: ${customerDetails.installment.toLocaleString()} บาท/เดือน\nทีม: ${customerDetails.team}\n\nคุณต้องการทราบข้อมูลเพิ่มเติมหรือไม่?`,
          sender: 'ai',
          timestamp: new Date(),
          relatedCustomerId: customer.id
        };
        setMessages(prevMessages => [...prevMessages, responseMessage]);
      }
    }, 1000);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputText("");
    setExtendedInput(false);
    setIsTyping(true);

    // Check for customer related queries
    handleCustomerSearch(inputText);

    // Simulate response
    setTimeout(() => {
      let responseText = "";
      if (activeTab === 'ai') {
        if (inputText.toLowerCase().includes("สวัสดี") || inputText.toLowerCase().includes("หวัดดี")) {
          responseText = "สวัสดีครับ มีอะไรให้ช่วยไหมครับ?";
        } else if (inputText.toLowerCase().includes("ลูกค้า")) {
          responseText = "ต้องการค้นหาข้อมูลลูกค้าใช่หรือไม่? กรุณาระบุชื่อหรือเลขบัญชี";
        } else if (inputText.toLowerCase().includes("รายงาน") || inputText.toLowerCase().includes("สรุป")) {
          responseText = "ขณะนี้มีลูกค้าในระบบทั้งหมด 6 ราย แบ่งเป็นสถานะ 'จบ' 3 ราย และ 'ไม่จบ' 3 ราย ยอดหนี้รวม 1,000,000 บาท";
        } else if (inputText.toLowerCase().includes("แนะนำ") || inputText.toLowerCase().includes("วิธี")) {
          responseText = "สำหรับการติดตามลูกค้าที่มีประสิทธิภาพ ผมขอแนะนำให้ตรวจสอบประวัติการติดต่อล่าสุด และโทรติดตามในช่วงเวลา 10.00-12.00 น. หรือ 17.00-19.00 น. ซึ่งเป็นช่วงที่มีโอกาสติดต่อได้มากที่สุด";
        } else {
          responseText = "ขอบคุณสำหรับข้อความ มีอะไรให้ช่วยเพิ่มเติมไหมครับ? ผมสามารถค้นหาข้อมูลลูกค้า วิเคราะห์สถานะหนี้ หรือแนะนำวิธีการติดตามได้";
        }
      } else {
        responseText = "รับทราบครับ จะรีบดำเนินการให้";
      }

      const responseMessage: Message = {
        id: Date.now().toString(),
        text: responseText,
        sender: activeTab,
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, responseMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !extendedInput) {
      e.preventDefault();
      handleSend();
    }
  };

  const navigateToCustomer = (customerId: string) => {
    navigate(`/customer/${customerId}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="bg-tedtam-blue dark:bg-blue-900 text-white p-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-blue-800 mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-bold">แชท</h1>
          <p className="text-xs text-gray-200">
            {activeTab === 'team' ? 'ทีมงาน' : 'AI ผู้ช่วย'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b dark:border-gray-700">
        <button
          className={`flex-1 py-2 px-4 text-center ${
            activeTab === 'team' 
              ? 'border-b-2 border-tedtam-orange font-medium text-tedtam-blue dark:text-white' 
              : 'text-gray-600 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('team')}
        >
          ทีมงาน
        </button>
        <button
          className={`flex-1 py-2 px-4 text-center ${
            activeTab === 'ai' 
              ? 'border-b-2 border-tedtam-orange font-medium text-tedtam-blue dark:text-white' 
              : 'text-gray-600 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('ai')}
        >
          <div className="flex items-center justify-center">
            <Bot className="h-4 w-4 mr-1" />
            <span>AI ผู้ช่วย</span>
          </div>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        <div className="space-y-4">
          {messages
            .filter(msg => activeTab === 'ai' ? msg.sender === 'user' || msg.sender === 'ai' : msg.sender === 'user' || msg.sender === 'team')
            .map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-tedtam-orange text-white'
                    : message.sender === 'ai'
                    ? 'bg-tedtam-blue text-white'
                    : 'bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.text}</p>
                {message.relatedCustomerId && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="mt-2 text-xs"
                    onClick={() => navigateToCustomer(message.relatedCustomerId as string)}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    ดูข้อมูลเพิ่มเติม
                  </Button>
                )}
                <p className="text-xs text-gray-200 dark:text-gray-400 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex space-x-1">
                  <div className="animate-bounce">•</div>
                  <div className="animate-bounce" style={{ animationDelay: "0.2s" }}>•</div>
                  <div className="animate-bounce" style={{ animationDelay: "0.4s" }}>•</div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">ผลการค้นหาลูกค้า:</p>
          <div className="space-y-1">
            {customerSuggestions.map(customer => (
              <div 
                key={customer.id} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer flex items-center"
                onClick={() => selectCustomer(customer)}
              >
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{customer.name}</p>
                  <p className="text-xs text-gray-500">{customer.accountNumber}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        {extendedInput ? (
          <div className="flex flex-col">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="พิมพ์ข้อความ..."
              className="mb-2 min-h-[100px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setExtendedInput(false)}
                className="text-xs"
              >
                ย่อลง
              </Button>
              <Button
                onClick={handleSend}
                className="bg-tedtam-blue hover:bg-tedtam-blue/90 dark:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-1" />
                ส่ง
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex">
            <Input
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                handleCustomerSearch(e.target.value);
              }}
              onKeyPress={handleKeyPress}
              placeholder={activeTab === 'ai' ? "ถามเกี่ยวกับลูกค้า หรือขอคำแนะนำ..." : "พิมพ์ข้อความ..."}
              className="flex-1 mr-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <Button
              variant="outline"
              onClick={() => setExtendedInput(true)}
              className="mr-2"
            >
              <span className="text-xs">ขยาย</span>
            </Button>
            <Button
              onClick={handleSend}
              className="bg-tedtam-blue hover:bg-tedtam-blue/90 dark:bg-blue-700"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        {activeTab === 'ai' && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <p>ลองถาม: "ช่วยค้นหาลูกค้า สมชาย", "ขอดูรายงานสรุป", "แนะนำวิธีติดตาม"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
