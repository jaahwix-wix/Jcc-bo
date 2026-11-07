/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  MapPin, 
  BookOpen, 
  Armchair, 
  Laptop, 
  Activity, 
  Building,
  X
} from 'lucide-react';
import { InventoryItem } from '../types';
import { SCHOOL_INFO } from '../initialData';

interface InventoryModuleProps {
  onNavigate?: (tab: string, arg?: any) => void;
}

const DEFAULT_INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'inv-1', itemCode: 'JCC-TXT-001', name: 'WAEC Standard Senior Secondary Mathematics Books (Grade 10-12)', category: 'Books & Curricula', quantity: 120, unit: 'Copies', condition: 'Good', location: 'Main Library - Shelf 4', unitValueSLE: 180, status: 'In Stock' },
  { id: 'inv-2', itemCode: 'JCC-TXT-002', name: 'Primary English Gateway Comprehension & Grammar Course', category: 'Books & Curricula', quantity: 200, unit: 'Copies', condition: 'Excellent', location: 'Junior Library', unitValueSLE: 120, status: 'In Stock' },
  { id: 'inv-3', itemCode: 'JCC-FUR-101', name: 'Dual Student Wooden Desks with Attached Bench', category: 'Classroom Furniture', quantity: 85, unit: 'Sets', condition: 'Good', location: 'Primary Block B & JSS Block C', unitValueSLE: 450, status: 'Allocated' },
  { id: 'inv-4', itemCode: 'JCC-FUR-102', name: 'Teacher Executive Wooden Pedestal Desk & Swivel Chair', category: 'Classroom Furniture', quantity: 18, unit: 'Sets', condition: 'Good', location: 'Staff Rooms & Classrooms', unitValueSLE: 1200, status: 'Allocated' },
  { id: 'inv-5', itemCode: 'JCC-FUR-103', name: 'Magnetic Wall-Mount Dry-Erase Whiteboards (4x8 ft)', category: 'Classroom Furniture', quantity: 16, unit: 'Boards', condition: 'Excellent', location: 'All Classrooms', unitValueSLE: 850, status: 'Allocated' },
  { id: 'inv-6', itemCode: 'JCC-SCI-201', name: 'Student Optical Monocular Microscopes (400x Magnification)', category: 'Science & ICT Equipment', quantity: 12, unit: 'Units', condition: 'Good', location: 'Senior Science Laboratory', unitValueSLE: 2500, status: 'In Stock' },
  { id: 'inv-7', itemCode: 'JCC-ICT-202', name: 'Core i5 Student Desktop Workstations with LED Monitors', category: 'Science & ICT Equipment', quantity: 24, unit: 'Stations', condition: 'Good', location: 'ICT Innovation Lab', unitValueSLE: 5500, status: 'In Stock' },
  { id: 'inv-8', itemCode: 'JCC-ICT-203', name: 'Heavy-Duty Workgroup Network Laser Printer & Copier', category: 'Science & ICT Equipment', quantity: 2, unit: 'Printers', condition: 'Excellent', location: 'Administration Office', unitValueSLE: 9800, status: 'Allocated' },
  { id: 'inv-9', itemCode: 'JCC-SPT-301', name: 'FIFA Standard Match Footballs & Training Cones Kit', category: 'Sports & Facilities', quantity: 25, unit: 'Balls/Kits', condition: 'Good', location: 'Sports Store Room', unitValueSLE: 150, status: 'In Stock' },
  { id: 'inv-10', itemCode: 'JCC-SPT-302', name: 'School Inter-House Athletics Running Track Equipment', category: 'Sports & Facilities', quantity: 1, unit: 'Set', condition: 'Good', location: 'Sports Store Room', unitValueSLE: 3200, status: 'In Stock' },
  { id: 'inv-11', itemCode: 'JCC-ADM-401', name: 'Yamaha 8.5 KVA Backup Diesel Generator for Campus Power', category: 'Administrative Assets', quantity: 1, unit: 'Generator', condition: 'Good', location: 'Generator House', unitValueSLE: 24000, status: 'Allocated' }
];

export default function InventoryModule({ onNavigate }: InventoryModuleProps) {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const cached = localStorage.getItem('jcc_inventory_items');
      if (cached) return JSON.parse(cached);
    } catch {}
    return DEFAULT_INVENTORY_ITEMS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<InventoryItem['category']>('Books & Curricula');
  const [formQuantity, setFormQuantity] = useState(1);
  const [formUnit, setFormUnit] = useState('Units');
  const [formCondition, setFormCondition] = useState<InventoryItem['condition']>('Good');
  const [formLocation, setFormLocation] = useState('');
  const [formValue, setFormValue] = useState(100);
  const [formStatus, setFormStatus] = useState<InventoryItem['status']>('In Stock');

  const categories = ['Books & Curricula', 'Classroom Furniture', 'Science & ICT Equipment', 'Sports & Facilities', 'Administrative Assets'] as const;

  // Valuation computations
  const totalValuation = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitValueSLE), 0);
  }, [items]);

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesCond = selectedCondition === 'All' || item.condition === selectedCondition;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                            item.itemCode.toLowerCase().includes(search.toLowerCase()) ||
                            item.location.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesCond && matchesSearch;
    });
  }, [items, selectedCategory, selectedCondition, search]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Books & Curricula');
    setFormQuantity(10);
    setFormUnit('Units');
    setFormCondition('Good');
    setFormLocation('Main Campus');
    setFormValue(150);
    setFormStatus('In Stock');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormQuantity(item.quantity);
    setFormUnit(item.unit);
    setFormCondition(item.condition);
    setFormLocation(item.location);
    setFormValue(item.unitValueSLE);
    setFormStatus(item.status);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (!confirm('Are you sure you want to remove this asset item from inventory?')) return;
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    localStorage.setItem('jcc_inventory_items', JSON.stringify(updated));
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let updated: InventoryItem[];
    if (editingItem) {
      updated = items.map(i => i.id === editingItem.id ? {
        ...i,
        name: formName,
        category: formCategory,
        quantity: formQuantity,
        unit: formUnit,
        condition: formCondition,
        location: formLocation,
        unitValueSLE: formValue,
        status: formStatus
      } : i);
    } else {
      const codePrefix = formCategory === 'Books & Curricula' ? 'TXT' : 
                         formCategory === 'Classroom Furniture' ? 'FUR' : 
                         formCategory === 'Science & ICT Equipment' ? 'ICT' : 
                         formCategory === 'Sports & Facilities' ? 'SPT' : 'ADM';

      const newItem: InventoryItem = {
        id: `inv-${Date.now()}`,
        itemCode: `JCC-${codePrefix}-${Math.floor(100 + Math.random() * 900)}`,
        name: formName,
        category: formCategory,
        quantity: formQuantity,
        unit: formUnit,
        condition: formCondition,
        location: formLocation,
        unitValueSLE: formValue,
        status: formStatus
      };
      updated = [newItem, ...items];
    }

    setItems(updated);
    localStorage.setItem('jcc_inventory_items', JSON.stringify(updated));
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="inventory-management-module">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Package className="w-3.5 h-3.5" />
              <span>Campus Asset & Equipment Inventory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">School Inventory & Assets</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Maintain institutional oversight of textbooks, laboratory equipment, computing assets, classroom desks, and school facility infrastructure in Bo, Sierra Leone.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleOpenAdd}
              className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer border border-teal-400/40"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Asset</span>
            </button>
            <button
              onClick={() => window.print()}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-teal-300" />
              <span>Print Asset Audit</span>
            </button>
          </div>
        </div>

        {/* Valuation Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80 text-xs">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Total Asset Value</span>
            <span className="text-xl font-bold text-teal-300 mt-0.5 block">SLE {totalValuation.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Total Registered Items</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{items.length} Asset Lines</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Physical Units in Stock</span>
            <span className="text-xl font-bold text-teal-200 mt-0.5 block">{totalQuantity} Units</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">MBSSE Audit Standing</span>
            <span className="text-xl font-bold text-emerald-400 mt-0.5 block">Verified Compliant</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none focus:border-teal-500"
          >
            <option value="All">All Categories ({items.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none focus:border-teal-500"
          >
            <option value="All">All Conditions</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair / Serviceable</option>
            <option value="Needs Repair">Needs Repair</option>
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search asset, item code, or location..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-teal-500 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Asset Inventory Roster
          </h3>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {filteredItems.length} matching items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Asset Code</th>
                <th className="py-3 px-4">Item Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4 text-right">Value (SLE)</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-teal-700 dark:text-teal-400">
                    {item.itemCode}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                    <div className="text-[11px] text-slate-400">{item.status}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.category}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.quantity}</span> {item.unit}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{item.location}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.condition === 'Excellent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      item.condition === 'Good' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                      item.condition === 'Needs Repair' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold font-mono text-slate-900 dark:text-white">
                    SLE {(item.quantity * item.unitValueSLE).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <span>Jonathan's Child Care Institutional Assets • Bo, Sierra Leone</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Total Valuation: SLE {totalValuation.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Add / Edit Inventory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingItem ? 'Edit Asset Record' : 'Register New Asset Item'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Item Description <span className="text-rose-500">*</span></label>
                <input 
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. WAEC Physics Textbooks, Student Dual Desks"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Condition</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair / Serviceable</option>
                    <option value="Needs Repair">Needs Repair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Quantity</label>
                  <input 
                    type="number"
                    min={1}
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Unit Type</label>
                  <input 
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="e.g. Copies, Desks"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Unit Value (SLE)</label>
                  <input 
                    type="number"
                    min={0}
                    value={formValue}
                    onChange={(e) => setFormValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Physical Location on Campus</label>
                <input 
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. Senior Science Lab, Library Shelf 2"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
