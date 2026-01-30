import React, { useEffect, useMemo, useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebaseconfig";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

type IntlRate = {
  id: string;
  country_name: string;
  base_rate_5_10kg: number;
  est_duration: string;
  region: string;
  updatedAt?: any;
};

const COLLECTION = "pricing_international";

export default function TariffSetting() {
  const { user } = useAuth(); // you can enforce role guards in router; keep UI simple here
  const [intlRates, setIntlRates] = useState<IntlRate[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const colRef = useMemo(() => collection(db, COLLECTION), []);

  useEffect(() => {
    void fetchRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRates = async () => {
    try {
      const q = query(colRef, orderBy("country_name", "asc"));
      const snap = await getDocs(q);
      const rows: IntlRate[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setIntlRates(rows);
      setHasChanges(false);
    } catch (e) {
      console.error("Failed to fetch rates:", e);
      alert("Failed to load rates. Check Firestore rules / connection.");
    }
  };

  const handleRateChange = (id: string, field: keyof IntlRate, value: any) => {
    setIntlRates((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    setHasChanges(true);
  };

  const addNewCountry = () => {
    const newEntry: IntlRate = {
      id: crypto.randomUUID(),
      country_name: "New Country",
      base_rate_5_10kg: 0,
      est_duration: "3-5 Days",
      region: "Asia",
    };
    setIntlRates((prev) => [newEntry, ...prev]);
    setHasChanges(true);
  };

  const removeRowLocal = (id: string) => {
    setIntlRates((prev) => prev.filter((r) => r.id !== id));
    setHasChanges(true);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      // Upsert all rows currently in state
      await Promise.all(
        intlRates.map((rate) =>
          setDoc(
            doc(db, COLLECTION, rate.id),
            {
              country_name: rate.country_name,
              base_rate_5_10kg: Number(rate.base_rate_5_10kg || 0),
              est_duration: rate.est_duration,
              region: rate.region,
              updatedAt: serverTimestamp(),
              updatedBy: user?.email ?? null,
            },
            { merge: true }
          )
        )
      );

      alert("Rates updated successfully!");
      setHasChanges(false);
    } catch (e: any) {
      console.error("Failed to save:", e);
      alert(`Error saving rates: ${e?.message ?? "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteFromFirestore = async (id: string) => {
    const ok = confirm("Delete this country rate permanently?");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, COLLECTION, id));
      removeRowLocal(id);
    } catch (e: any) {
      console.error("Delete failed:", e);
      alert(`Delete failed: ${e?.message ?? "Unknown error"}`);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tariff Configuration</h1>
          <p className="text-sm text-gray-500">Manage international shipping rates.</p>
        </div>

        {hasChanges && (
          <Button
            type="button"
            onClick={saveChanges}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center">
            <span className="w-2 h-6 bg-[#ff6b00] mr-2 rounded"></span>
            International Agent Rates
          </h3>

          <Button type="button" variant="outline" size="sm" onClick={addNewCountry}>
            <Plus className="mr-2 h-4 w-4" /> Add Country
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead>Base Rate (5-10kg)</TableHead>
              <TableHead>Est. Duration</TableHead>
              <TableHead>Region</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {intlRates.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell>
                  <Input
                    value={rate.country_name}
                    onChange={(e) => handleRateChange(rate.id, "country_name", e.target.value)}
                    className="font-bold text-[#0d2c54]"
                  />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={rate.base_rate_5_10kg}
                      onChange={(e) =>
                        handleRateChange(rate.id, "base_rate_5_10kg", Number(e.target.value))
                      }
                    />
                    <span className="text-xs text-gray-500">MMK</span>
                  </div>
                </TableCell>

                <TableCell>
                  <Input
                    value={rate.est_duration}
                    onChange={(e) => handleRateChange(rate.id, "est_duration", e.target.value)}
                  />
                </TableCell>

                <TableCell>
                  <select
                    className="p-2 border rounded text-sm w-full bg-white"
                    value={rate.region || "Asia"}
                    onChange={(e) => handleRateChange(rate.id, "region", e.target.value)}
                  >
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="North America">North America</option>
                  </select>
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    onClick={() => deleteFromFirestore(rate.id)}
                    aria-label="Delete row"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {intlRates.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-gray-500 py-10">
                  No rates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
