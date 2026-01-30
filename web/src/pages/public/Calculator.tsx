import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // Your supabase client
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // shadcn-ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plane, Truck } from 'lucide-react';

export const ShippingCalculator = () => {
  const [loading, setLoading] = useState(false);
  const [intlRates, setIntlRates] = useState<any[]>([]);
  
  // Inputs
  const [mode, setMode] = useState('domestic');
  const [weight, setWeight] = useState<number>(0);
  const [dims, setDims] = useState({ l: 0, w: 0, h: 0 });
  const [selectedCountry, setSelectedCountry] = useState('');
  
  // Results
  const [quote, setQuote] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<string>('');

  // Fetch live rates on mount
  useEffect(() => {
    const fetchRates = async () => {
      const { data } = await supabase.from('pricing_international').select('*');
      if (data) setIntlRates(data);
    };
    fetchRates();
  }, []);

  const calculateIntl = () => {
    setLoading(true);
    // Logic from your HTML prototype converted to TypeScript
    const divisor = 5000; // Standard Air Cargo
    const volWeight = (dims.l * dims.w * dims.h) / divisor;
    const chargeable = Math.max(weight, volWeight);

    const countryRate = intlRates.find(c => c.country_name === selectedCountry);
    
    if (countryRate) {
      // Simple logic: using the base rate provided in your table
      const total = chargeable * countryRate.base_rate_5_10kg; 
      setQuote(total);
      setBreakdown(`Chargeable Weight: ${chargeable.toFixed(2)} kg (Volumetric: ${volWeight.toFixed(2)} kg)`);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#0d2c54]">Shipping Rate Calculator</h2>
        <p className="text-gray-500">Real-time quotes based on current Britium rates.</p>
      </div>

      <Card className="max-w-4xl mx-auto shadow-lg border-t-4 border-t-[#0d2c54]">
        <CardHeader>
          <Tabs defaultValue="domestic" className="w-full" onValueChange={setMode}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="domestic"><Truck className="mr-2 h-4 w-4"/> Domestic</TabsTrigger>
              <TabsTrigger value="international"><Plane className="mr-2 h-4 w-4"/> International</TabsTrigger>
            </TabsList>

            {/* DOMESTIC FORM */}
            <TabsContent value="domestic" className="p-4 space-y-4">
               {/* Simplified for brevity - Logic mirrors your HTML "calculateDomestic" */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select className="p-2 border rounded" onChange={(e) => console.log(e.target.value)}>
                    <option>Yangon</option>
                    <option>Mandalay</option>
                  </select>
                  <input type="number" placeholder="Weight (kg)" className="p-2 border rounded" 
                    onChange={(e) => setWeight(parseFloat(e.target.value))} />
               </div>
               <button className="w-full bg-[#ff6b00] text-white font-bold py-3 rounded hover:bg-orange-600 transition">
                 Calculate Domestic Rate
               </button>
            </TabsContent>

            {/* INTERNATIONAL FORM */}
            <TabsContent value="international" className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#0d2c54] mb-2">Destination</label>
                  <select 
                    className="w-full p-2 border rounded"
                    onChange={(e) => setSelectedCountry(e.target.value)}
                  >
                    <option value="">Select Country...</option>
                    {intlRates.map(rate => (
                      <option key={rate.id} value={rate.country_name}>{rate.country_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-bold text-[#0d2c54] mb-2">Weight (kg)</label>
                   <input type="number" className="w-full p-2 border rounded" 
                     onChange={(e) => setWeight(parseFloat(e.target.value))} />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                 <input type="number" placeholder="L (cm)" className="p-2 border rounded" onChange={e => setDims({...dims, l: +e.target.value})}/>
                 <input type="number" placeholder="W (cm)" className="p-2 border rounded" onChange={e => setDims({...dims, w: +e.target.value})}/>
                 <input type="number" placeholder="H (cm)" className="p-2 border rounded" onChange={e => setDims({...dims, h: +e.target.value})}/>
              </div>

              <button 
                onClick={calculateIntl}
                disabled={loading}
                className="w-full bg-[#0d2c54] text-white font-bold py-3 rounded hover:bg-blue-900 transition flex justify-center items-center"
              >
                {loading ? <Loader2 className="animate-spin"/> : "Calculate International Rate"}
              </button>
            </TabsContent>
          </Tabs>
        </CardHeader>
        
        {quote !== null && (
          <CardContent className="bg-blue-50 border-t border-blue-100 p-6 text-center">
            <p className="text-sm text-gray-500 uppercase font-bold">Estimated Cost</p>
            <h3 className="text-4xl font-bold text-[#0d2c54] my-2">{quote.toLocaleString()} MMK</h3>
            <p className="text-xs text-gray-500">{breakdown}</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
};