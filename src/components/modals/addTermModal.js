'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { FileText, ClipboardList, Truck, DollarSign, Plus, Trash2, Search } from 'lucide-react';

const CreateQuote = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeSection, setActiveSection] = useState('details');
  const [quoteData, setQuoteData] = useState({
    customerId: '',
    contactId: '',
    currency: 'USD',
    lineItems: [],
    warrantyTerms: '',
    deliveryTerms: '',
    deliveryPlace: '',
    paymentTerms: '',
    vatKdv: '',
    notes: [],
    subtotal: 0,
    discount: 0,
    vat: 0,
    shippingHandling: 0,
    finalAmountDue: 0,
  });

  useEffect(() => {
    fetchCustomers();
    fetchContacts();
    fetchTerms();
    fetchPremadeNotes();
  }, []);

  const fetchCustomers = async () => {
    // Implement customer fetching logic
  };

  const fetchContacts = async () => {
    // Implement contact fetching logic
  };

  const fetchTerms = async () => {
    // Implement terms fetching logic
  };

  const fetchPremadeNotes = async () => {
    // Implement premade notes fetching logic
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuoteData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setQuoteData(prev => ({ ...prev, customerId, contactId: '' }));
    fetchContactsForCustomer(customerId);
  };

  const fetchContactsForCustomer = async (customerId) => {
    // Implement fetching contacts for the selected customer
  };

  const addLineItem = () => {
    setQuoteData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, {
        partNumber: '',
        description: '',
        quantity: 1,
        dealerPrice: '',
        customsTaxes: [],
        listPrice: '',
        salePrice: '',
        priceAdjustment: { percentage: 0, amount: '' },
        profitMargin: { amount: 0, percentage: 0 },
      }]
    }));
  };

  const removeLineItem = (index) => {
    setQuoteData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  const addCustomsTax = (lineItemIndex) => {
    setQuoteData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, index) => {
        if (index === lineItemIndex) {
          return {
            ...item,
            customsTaxes: [...item.customsTaxes, { percentage: 0, amount: 0 }]
          };
        }
        return item;
      })
    }));
  };

  const removeCustomsTax = (lineItemIndex, taxIndex) => {
    setQuoteData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, index) => {
        if (index === lineItemIndex) {
          return {
            ...item,
            customsTaxes: item.customsTaxes.filter((_, i) => i !== taxIndex)
          };
        }
        return item;
      })
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    setQuoteData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'dealerPrice' || field === 'customsTaxes' || field === 'listPrice' || field === 'salePrice') {
            updatedItem.dealerTotal = calculateDealerTotal(updatedItem);
          }
          // Update profit margin
          const cost = parseFloat(updatedItem.dealerPrice) || 0;
          const revenue = parseFloat(updatedItem.salePrice) || 0;
          updatedItem.profitMargin = {
            amount: revenue - cost,
            percentage: cost !== 0 ? ((revenue - cost) / cost) * 100 : 0
          };
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateDealerTotal = (item) => {
    const subtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.dealerPrice) || 0);
    const taxesTotal = item.customsTaxes.reduce((total, tax) => {
      return total + (subtotal * (parseFloat(tax.percentage) || 0) / 100);
    }, 0);
    return subtotal + taxesTotal;
  };

  const calculateSubtotal = () => {
    return quoteData.lineItems.reduce((total, item) => {
      return total + ((parseFloat(item.salePrice) || 0) * (parseFloat(item.quantity) || 0));
    }, 0);
  };

  const calculateVAT = () => {
    const subtotal = calculateSubtotal();
    const vatPercentage = 20;
    return {
      percentage: vatPercentage,
      amount: subtotal * (vatPercentage / 100)
    };
  };

  const calculateFinalAmountDue = () => {
    const subtotal = calculateSubtotal();
    const vat = calculateVAT().amount;
    return subtotal - quoteData.discount + vat + quoteData.shippingHandling;
  };

  const formatCurrency = (amount, currency) => {
    if (amount === '' || amount === null) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleCurrencyInput = (e, index, field) => {
    const value = e.target.value.replace(/[^0-9.,]/g, '');
    handleLineItemChange(index, field, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        throw new Error('Failed to create quote');
      }

      const createdQuote = await response.json();
      console.log('Quote created:', createdQuote);
      router.push('/quotes');
    } catch (error) {
      console.error('Error creating quote:', error);
      // TODO: Implement error notification
    }
  };

  const navItems = [
    { id: 'details', label: 'Details', icon: <FileText className="w-4 h-4 mr-2" /> },
    { id: 'items', label: 'Items', icon: <ClipboardList className="w-4 h-4 mr-2" /> },
    { id: 'terms', label: 'Terms', icon: <Truck className="w-4 h-4 mr-2" /> },
    { id: 'summary', label: 'Summary', icon: <DollarSign className="w-4 h-4 mr-2" /> },
  ];

  return (
    <MainLayout>
      <div className="flex h-full">
        <nav className="w-40 bg-gray-800 p-4 flex flex-col">
          <h2 className="text-xl font-bold text-blue-400 mb-4">Sections</h2>
          <ul className="space-y-2 flex-grow">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`w-full text-left px-4 py-2 rounded flex items-center ${activeSection === item.id ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1 p-6 bg-gray-900 overflow-auto">
          <h1 className="text-4xl font-bold text-blue-400 mb-6">Create New Quote</h1>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="h-full overflow-auto pr-4">
              <div id="details" className="bg-gray-800 p-6 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-blue-300 mb-4">Quote Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex space-x-4">
                    <div className="w-1/3">
                      <label htmlFor="customer" className="block text-sm font-medium text-gray-300 mb-1">Customer</label>
                      <select
                        id="customer"
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={quoteData.customerId}
                        onChange={handleCustomerChange}
                      >
                        <option value="">Select a customer</option>
                        {customers.map(customer => (
                          <option key={customer.id} value={customer.id}>{customer.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-2/3 relative">
                      <label htmlFor="customerSearch" className="block text-sm font-medium text-gray-300 mb-1">Search Customers</label>
                      <input
                        id="customerSearch"
                        type="text"
                        placeholder="Search customers"
                        className="w-full p-2 bg-gray-700 text-white rounded"
                      />
                      <Search className="absolute right-3 top-9 text-gray-400" />
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-between items-end">
                    <div className="w-1/3">
                      <label htmlFor="contact" className="block text-sm font-medium text-gray-300 mb-1">Contact</label>
                      <select
                        id="contact"
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={quoteData.contactId}
                        onChange={(e) => setQuoteData(prev => ({ ...prev, contactId: e.target.value }))}
                      >
                        <option value="">Select a contact</option>
                        {contacts.map(contact => (
                          <option key={contact.id} value={contact.id}>{contact.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-1/4">
                      <label htmlFor="currency" className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                      <select
                        id="currency"
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={quoteData.currency}
                        onChange={(e) => handleInputChange({ target: { name: 'currency', value: e.target.value } })}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="TRY">TRY</option>
                      </select>
                    </div>
                  </div>
                  {quoteData.customerId && (
                    <div className="col-span-2 bg-gray-700 p-4 rounded">
                      <h3 className="text-lg font-semibold text-blue-300 mb-2">Customer Information</h3>
                      <p><span className="font-medium">Customer Name:</span> {customers.find(c => c.id === quoteData.customerId)?.name}</p>
                      <p><span className="font-medium">Address:</span> {customers.find(c => c.id === quoteData.customerId)?.address}</p>
                      {quoteData.contactId && (
                        <>
                          <p><span className="font-medium">Contact Name:</span> {contacts.find(c => c.id === quoteData.contactId)?.name}</p>
                          <p><span className="font-medium">Contact Phone:</span> {contacts.find(c => c.id === quoteData.contactId)?.phone}</p>
                          <p><span className="font-medium">Contact Email:</span> {contacts.find(c => c.id === quoteData.contactId)?.email}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div id="items" className="bg-gray-800 p-6 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-blue-300 mb-4">Line Items</h2>
                {quoteData.lineItems.map((item, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-1/6">
                        <label htmlFor={`partNumber-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Part Number*</label>
                        <input
                          id={`partNumber-${index}`}
                          className="w-full p-2 bg-gray-600 text-white rounded"
                          value={item.partNumber}
                          onChange={(e) => handleLineItemChange(index, 'partNumber', e.target.value)}
                          placeholder="Enter part number"
                          required
                        />
                      </div>
                      <div className="w-2/5">
                        <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Description*</label>
                        <input
                          id={`description-${index}`}
                          className="w-full p-2 bg-gray-600 text-white rounded"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                          placeholder="Enter description"
                          required
                        />
                      </div>
                      <div className="w-1/12">
                        <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
                        <input
                          id={`quantity-${index}`}
                          type="number"
                          className="w-full p-2 bg-gray-600 text-white rounded"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                          min="1"
                          step="1"
                        />
                      </div>
                      <div className="w-1/6">
                        <label htmlFor={`unitPrice-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Unit Price</label>
                        <input
                          id={`unitPrice-${index}`}
                          type="text"
                          className="w-full p-2 bg-gray-600 text-white rounded"
                          value={formatCurrency(item.salePrice, quoteData.currency)}
                          readOnly
                        />
                      </div>
                      <div className="w-1/6">
                        <label htmlFor={`extendedPrice-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Extended Price</label>
                        <input
                          id={`extendedPrice-${index}`}
                          type="text"
                          className="w-full p-2 bg-gray-600 text-white rounded"
                          value={formatCurrency((parseFloat(item.salePrice) || 0) * (parseFloat(item.quantity) || 0), quoteData.currency)}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-4 mb-2">
                      <div>
                        <label htmlFor={`dealerPrice-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Dealer Price*</label>
                        <input
                          id={`dealerPrice-${index}`}
                          type="text"
                          className="w-full p-2 bg-gray-600 text-white rounded"
                          value={item.dealerPrice}
                          onChange={(e) => handleCurrencyInput(e, index, 'dealerPrice')}
                          placeholder="Enter dealer price"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor={`dealerTotal-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Dealer Total</label>
                        <input
                          id={`dealerTotal-${index}`}
                          type="text"
                          className="w-full p-2 bg-gray-600 text-white rounded"
                          value={formatCurrency(calculateDealerTotal(item), quoteData.currency)}
                          readOnly
                        />
                      </div>
                      <div>
                        <label htmlFor={`listPrice-${index}`} className="block text-sm font-medium text-gray-300 mb-1">List Price*</label>
                        <input
                          id={`listPrice-${index}`}
                          type="text"
                          className="w-full p-2 bg-gray-600 text-white rounded"
                          value={item.listPrice}
                          onChange={(e) => handleCurrencyInput(e, index, 'listPrice')}
                          placeholder="Enter list price"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor={`salePrice-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Sale Price</label>
                        <input
                          id={`salePrice-${index}`}
                          type="text"
                          className="w-full p-2 bg-gray-600 text-white rounded"
                          value={item.salePrice}
                          onChange={(e) => handleCurrencyInput(e, index, 'salePrice')}
                          placeholder="Enter sale price"
                        />
                      </div>
                      <div>
                        <label htmlFor={`priceAdjustment-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Price Adjustment</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            className="w-1/2 p-2 bg-gray-600 text-white rounded"
                            value={item.priceAdjustment.percentage}
                            onChange={(e) => handleLineItemChange(index, 'priceAdjustment.percentage', parseFloat(e.target.value))}
                            placeholder="%"
                          />
                          <input
                            type="text"
                            className="w-1/2 p-2 bg-gray-600 text-white rounded"
                            value={item.priceAdjustment.amount}
                            onChange={(e) => handleCurrencyInput(e, index, 'priceAdjustment.amount')}
                            placeholder="Amount"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor={`profitMargin-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Profit Margin</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="w-1/2 p-2 bg-gray-600 text-white rounded"
                            value={formatCurrency(item.profitMargin.amount, quoteData.currency)}
                            readOnly
                          />
                          <input
                            type="text"
                            className="w-1/2 p-2 bg-gray-600 text-white rounded"
                            value={`${item.profitMargin.percentage.toFixed(2)}%`}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      {item.customsTaxes.map((tax, taxIndex) => (
                        <div key={taxIndex} className="flex items-center gap-2 mb-2">
                          <div className="relative w-1/4">
                            <input
                              type="number"
                              placeholder="Tax %"
                              className="w-full p-2 bg-gray-600 text-white rounded"
                              value={tax.percentage}
                              onChange={(e) => handleLineItemChange(index, `customsTaxes[${taxIndex}].percentage`, parseFloat(e.target.value))}
                            />
                            <span className="absolute right-2 top-2 text-gray-400">%</span>
                          </div>
                          <div className="relative w-1/4">
                            <input
                              type="text"
                              placeholder="Tax Amount"
                              className="w-full p-2 bg-gray-600 text-white rounded"
                              value={formatCurrency(tax.amount, quoteData.currency)}
                              readOnly
                            />
                          </div>
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeCustomsTax(index, taxIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4">
                      <button
                        type="button"
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                        onClick={() => addCustomsTax(index)}
                      >
                        Add Tax
                      </button>
                      <button
                        type="button"
                        className="flex items-center px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        onClick={() => removeLineItem(index)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Line Item
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={addLineItem}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Line Item
                </button>
              </div>

              <div id="terms" className="bg-gray-800 p-6 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-blue-300 mb-4">Terms and Conditions</h2>
                <div className="grid grid-cols-2 gap-4">
                  {['warrantyTerms', 'deliveryTerms', 'paymentTerms', 'deliveryPlace'].map((term) => (
                    <div key={term} className="flex flex-col space-y-1">
                      <label htmlFor={term} className="text-sm font-medium text-gray-300">
                        {term.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}*
                      </label>
                      <div className="flex">
                        <select
                          id={term}
                          name={term}
                          className="flex-grow p-2 bg-gray-700 text-white rounded-l"
                          value={quoteData[term]}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select {term.replace(/([A-Z])/g, ' $1').toLowerCase()}</option>
                          {/* Add options here */}
                        </select>
                        <button
                          type="button"
                          className="px-3 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700"
                          onClick={() => {/* Add new term logic */}}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="vatKdv" className="text-sm font-medium text-gray-300">VAT/KDV*</label>
                    <select
                      id="vatKdv"
                      name="vatKdv"
                      className="w-full p-2 bg-gray-700 text-white rounded"
                      value={quoteData.vatKdv}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select VAT/KDV option</option>
                      <option value="included_en">VAT Included</option>
                      <option value="not_included_en">VAT Not Included</option>
                      <option value="included_tr">KDV Dahil</option>
                      <option value="not_included_tr">KDV Hariç</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">Notes*</label>
                  <div className="flex gap-2 mb-2">
                    <select
                      className="flex-grow p-2 bg-gray-700 text-white rounded-l"
                      onChange={(e) => setQuoteData(prev => ({ ...prev, notes: [...prev.notes, e.target.value] }))}
                    >
                      <option value="">Select a note</option>
                      {/* Add premade notes options */}
                    </select>
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700"
                      onClick={() => {/* Add selected note to quoteData.notes */}}
                    >
                      + Add
                    </button>
                  </div>
                  <textarea
                    id="notes"
                    name="notes"
                    className="w-full p-2 bg-gray-700 text-white rounded"
                    value={quoteData.notes.join('\n')}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, notes: e.target.value.split('\n') }))}
                    rows={4}
                    required
                  />
                </div>
              </div>

              <div id="summary" className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-blue-300 mb-4">Quote Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-300">Subtotal:</span>
                    <span className="text-white">{formatCurrency(calculateSubtotal(), quoteData.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-300">Discount:</span>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-32 p-2 bg-gray-700 text-white rounded"
                        value={quoteData.discount}
                        onChange={(e) => setQuoteData(prev => ({ ...prev, discount: e.target.value }))}
                        placeholder="Enter discount"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-300">Total after discount:</span>
                    <span className="text-white">{formatCurrency(calculateSubtotal() - parseFloat(quoteData.discount || 0), quoteData.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-300">VAT/KDV ({calculateVAT().percentage}%):</span>
                    <span className="text-white">{formatCurrency(calculateVAT().amount, quoteData.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-300">Shipping & Handling:</span>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-32 p-2 bg-gray-700 text-white rounded"
                        value={quoteData.shippingHandling}
                        onChange={(e) => setQuoteData(prev => ({ ...prev, shippingHandling: e.target.value }))}
                        placeholder="Enter S&H"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-300">Final Amount Due:</span>
                    <span className="text-white">{formatCurrency(calculateFinalAmountDue(), quoteData.currency)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Submit Quote
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </MainLayout>
  );
};

export default CreateQuote;