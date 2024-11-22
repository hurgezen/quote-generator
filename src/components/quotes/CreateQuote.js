'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { FileText, ClipboardList, Truck, DollarSign, Plus, Trash2, Search, Building2, User } from 'lucide-react';

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
    discount: '',
    vat: 0,
    shippingHandling: '',
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

  const formatCurrency = useCallback((amount, currency) => {
    if (amount === '' || amount === null || isNaN(amount)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  const calculateDealerTotal = useCallback((item) => {
    const quantity = item.quantityNumeric || 0;
    const dealerPrice = item.dealerPriceNumeric || 0;
    const subtotal = quantity * dealerPrice;
    const taxesTotal = item.customsTaxes.reduce((total, tax) => {
      return total + (subtotal * (parseFloat(tax.percentage) || 0) / 100);
    }, 0);
    const total = subtotal + taxesTotal;
    const dealerPriceWithTax = dealerPrice + (taxesTotal / quantity);
    console.log('calculateDealerTotal:', { quantity, dealerPrice, subtotal, taxesTotal, total, dealerPriceWithTax });
    return { total, dealerPriceWithTax };
  }, []);

  const calculateProfitMargin = useCallback((item) => {
    const cost = item.dealerPriceWithTax || item.dealerPriceNumeric || 0;
    const revenue = item.salePriceNumeric || 0;
    const quantity = item.quantityNumeric || 0;
    const amount = revenue - cost;
    const percentage = cost !== 0 ? (amount / cost) * 100 : 0;
    const extendedProfit = amount * quantity;
    console.log('calculateProfitMargin:', { cost, revenue, amount, percentage, extendedProfit });
    return { amount, percentage, extendedProfit };
  }, []);

  const calculateAdjustedSalePrice = useCallback((item) => {
    const originalSalePrice = item.originalSalePriceNumeric || item.salePriceNumeric || 0;
    const adjustmentPercentage = parseFloat(item.priceAdjustment.percentage) || 0;
    const adjustmentAmount = parseFloat(item.priceAdjustment.amount) || 0;
  
    let adjustedPrice = originalSalePrice;
    if (adjustmentPercentage !== 0) {
      adjustedPrice *= (1 + adjustmentPercentage / 100);
    }
    adjustedPrice += adjustmentAmount;
  
    console.log('calculateAdjustedSalePrice:', { 
      originalSalePrice, 
      adjustmentPercentage, 
      adjustmentAmount, 
      adjustedPrice 
    });
    
    return Math.max(0, adjustedPrice); // Ensure the price doesn't go below 0
  }, []);

  const updateLineItem = useCallback((item) => {
    const { total: dealerTotal, dealerPriceWithTax } = calculateDealerTotal(item);
    const updatedItem = {
      ...item,
      dealerTotal,
      dealerPriceWithTax,
      salePriceNumeric: calculateAdjustedSalePrice(item),
    };
    updatedItem.salePrice = formatCurrency(updatedItem.salePriceNumeric, quoteData.currency);
    updatedItem.profitMargin = calculateProfitMargin(updatedItem);

    // Recalculate customs tax amounts
    updatedItem.customsTaxes = updatedItem.customsTaxes.map(tax => ({
      ...tax,
      amount: (updatedItem.dealerPriceNumeric * updatedItem.quantityNumeric * (parseFloat(tax.percentage) || 0)) / 100
    }));

    return updatedItem;
  }, [calculateDealerTotal, calculateAdjustedSalePrice, calculateProfitMargin, formatCurrency, quoteData.currency]);

  const handleLineItemChange = useCallback((index, field, value) => {
    console.log('handleLineItemChange called:', { index, field, value });
    setQuoteData(prev => {
      const newLineItems = prev.lineItems.map((item, i) => {
        if (i === index) {
          let updatedItem = { ...item };
          if (field.startsWith('customsTaxes[')) {
            const taxIndex = parseInt(field.match(/\[(\d+)\]/)[1]);
            const taxField = field.split('.')[1];
            updatedItem.customsTaxes = updatedItem.customsTaxes.map((tax, i) => 
              i === taxIndex ? { ...tax, [taxField]: value } : tax
            );
          } else if (field.startsWith('priceAdjustment.')) {
            const [, adjustmentField] = field.split('.');
            updatedItem.priceAdjustment = {
              ...updatedItem.priceAdjustment,
              [adjustmentField]: value
            };
          } else {
            const numericValue = parseFloat(value) || 0;
            updatedItem = { ...updatedItem, [field]: value, [`${field}Numeric`]: numericValue };
            if (field === 'salePrice') {
              updatedItem.originalSalePriceNumeric = numericValue;
            }
          }
          
          return updateLineItem(updatedItem);
        }
        return item;
      });
      console.log('New line items after change:', newLineItems);
      return { ...prev, lineItems: newLineItems };
    });
  }, [updateLineItem]);

  const handleTaxInput = useCallback((e, index, taxIndex) => {
    const value = e.target.value.replace(/[^0-9.\-]/g, '');
    console.log('handleTaxInput:', { index, taxIndex, value });
    handleLineItemChange(index, `customsTaxes[${taxIndex}].percentage`, value);
  }, [handleLineItemChange]);

  const addLineItem = useCallback(() => {
    setQuoteData(prev => {
      const newLineItems = [...prev.lineItems, {
        partNumber: '',
        description: '',
        quantity: 1,
        quantityNumeric: 1,
        dealerPrice: '',
        dealerPriceNumeric: 0,
        customsTaxes: [],
        listPrice: '',
        listPriceNumeric: 0,
        salePrice: '',
        salePriceNumeric: 0,
        priceAdjustment: { percentage: '', amount: '' },
        profitMargin: { amount: 0, percentage: 0, extendedProfit: 0 },
        dealerTotal: 0,
      }];
      console.log('Added new line item:', newLineItems);
      return { ...prev, lineItems: newLineItems };
    });
  }, []);

  const removeLineItem = useCallback((index) => {
    setQuoteData(prev => {
      const newLineItems = prev.lineItems.filter((_, i) => i !== index);
      console.log('Removed line item at index:', index, 'New line items:', newLineItems);
      return { ...prev, lineItems: newLineItems };
    });
  }, []);

  const addCustomsTax = useCallback((lineItemIndex) => {
    setQuoteData(prev => {
      const newLineItems = prev.lineItems.map((item, index) => {
        if (index === lineItemIndex) {
          const updatedItem = {
            ...item,
            customsTaxes: [...item.customsTaxes, { percentage: '', amount: 0 }]
          };
          return updateLineItem(updatedItem);
        }
        return item;
      });
      console.log('Added customs tax to line item:', lineItemIndex, 'New line items:', newLineItems);
      return { ...prev, lineItems: newLineItems };
    });
  }, [updateLineItem]);

  const removeCustomsTax = useCallback((lineItemIndex, taxIndex) => {
    setQuoteData(prev => {
      const newLineItems = prev.lineItems.map((item, index) => {
        if (index === lineItemIndex) {
          const updatedItem = {
            ...item,
            customsTaxes: item.customsTaxes.filter((_, i) => i !== taxIndex)
          };
          return updateLineItem(updatedItem);
        }
        return item;
      });
      console.log('Removed customs tax from line item:', lineItemIndex, 'tax index:', taxIndex, 'New line items:', newLineItems);
      return { ...prev, lineItems: newLineItems };
    });
  }, [updateLineItem]);

  const handleCurrencyInput = useCallback((e, index, field) => {
    const value = e.target.value.replace(/[^0-9.,]/g, '');
    console.log('handleCurrencyInput:', { index, field, value });
    handleLineItemChange(index, field, value);
  }, [handleLineItemChange]);

  const handlePercentageInput = useCallback((e, index, field) => {
    const value = e.target.value.replace(/[^0-9.\-]/g, '');
    console.log('handlePercentageInput:', { index, field, value });
    handleLineItemChange(index, field, value);
  }, [handleLineItemChange]);

  const handlePriceAdjustmentInput = useCallback((e, index, field) => {
    const value = e.target.value.replace(/[^0-9.,\-]/g, '');
    console.log('handlePriceAdjustmentInput:', { index, field, value });
    handleLineItemChange(index, `priceAdjustment.${field}`, value);
  }, [handleLineItemChange]);

  const handleBlur = useCallback((index, field) => {
    console.log('handleBlur called:', { index, field });
    setQuoteData(prev => {
      const newLineItems = prev.lineItems.map((item, i) => {
        if (i === index) {
          const numericValue = parseFloat(item[`${field}Numeric`]) || 0;
          const formattedValue = formatCurrency(numericValue, prev.currency);
          console.log('Formatting value:', { field, numericValue, formattedValue });
          const updatedItem = {
            ...item,
            [field]: formattedValue,
            [`${field}Numeric`]: numericValue,
          };
          updatedItem.dealerTotal = calculateDealerTotal(updatedItem);
          updatedItem.profitMargin = calculateProfitMargin(updatedItem);
          console.log('Updated item after blur:', updatedItem);
          return updatedItem;
        }
        return item;
      });
      console.log('New line items after blur:', newLineItems);
      return { ...prev, lineItems: newLineItems };
    });
  }, [formatCurrency, calculateDealerTotal, calculateProfitMargin]);

  const calculateSubtotal = useCallback(() => {
    return quoteData.lineItems.reduce((total, item) => {
      return total + ((item.salePriceNumeric || 0) * (item.quantityNumeric || 0));
    }, 0);
  }, [quoteData.lineItems]);

  const calculateVAT = useCallback(() => {
    const subtotal = calculateSubtotal();
    const vatPercentage = 20;
    return {
      percentage: vatPercentage,
      amount: subtotal * (vatPercentage / 100)
    };
  }, [calculateSubtotal]);

  const calculateFinalAmountDue = useCallback(() => {
    const subtotal = calculateSubtotal();
    const vat = calculateVAT().amount;
    return subtotal - parseFloat(quoteData.discount || 0) + vat + parseFloat(quoteData.shippingHandling || 0);
  }, [calculateSubtotal, calculateVAT, quoteData.discount, quoteData.shippingHandling]);

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
                      <div className="relative">
                        <select
                          id="customer"
                          className="w-full pl-10 p-2 bg-gray-700 text-white rounded"
                          value={quoteData.customerId}
                          onChange={handleCustomerChange}
                        >
                          <option value="">Select a customer</option>
                          {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>{customer.name}</option>
                          ))}
                        </select>
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                    </div>
                    <div className="w-2/3 relative">
                      <label htmlFor="customerSearch" className="block text-sm font-medium text-gray-300 mb-1">Search Customers</label>
                      <div className="relative">
                        <input
                          id="customerSearch"
                          type="text"
                          placeholder="Search customers"
                          className="w-full pl-10 p-2 bg-gray-700 text-white rounded"
                        />
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-between items-end">
                    <div className="w-1/3">
                      <label htmlFor="contact" className="block text-sm font-medium text-gray-300 mb-1">Contact</label>
                      <div className="relative">
                        <select
                          id="contact"
                          className="w-full pl-10 p-2 bg-gray-700 text-white rounded"
                          value={quoteData.contactId}
                          onChange={(e) => setQuoteData(prev => ({ ...prev, contactId: e.target.value }))}
                        >
                          <option value="">Select a contact</option>
                          {contacts.map(contact => (
                            <option key={contact.id} value={contact.id}>{contact.name}</option>
                          ))}
                        </select>
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      </div>
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
                    <div className="relative mb-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-500"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-gray-700 px-2 text-sm font-medium text-gray-300">
                          Customer Visible
                        </span>
                      </div>
                    </div>
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
                          value={formatCurrency(item.salePriceNumeric, quoteData.currency)}
                          readOnly
                        />
                      </div>
                      <div className="w-1/6">
                        <label htmlFor={`extendedPrice-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Extended Price</label>
                        <input
                          id={`extendedPrice-${index}`}
                          type="text"
                          className="w-full p-2 bg-gray-600 text-white rounded"
                          value={formatCurrency(item.salePriceNumeric * item.quantityNumeric, quoteData.currency)}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="relative mb-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-500"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-gray-700 px-2 text-sm font-medium text-gray-300">
                          Dealer Visible
                        </span>
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
                          onBlur={() => handleBlur(index, 'dealerPrice')}
                          placeholder="Enter dealer price"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor={`dealerPriceWithTax-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Dealer Price w/ Tax</label>
                        <input
                          id={`dealerPriceWithTax-${index}`}
                          type="text"
                          className="w-full p-2 bg-gray-600 text-white rounded"
                          value={formatCurrency(item.dealerPriceWithTax, quoteData.currency)}
                          readOnly
                        />
                      </div>
                      <div>
                        <label htmlFor={`dealerTotal-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Dealer Total</label>
                        <input
                          id={`dealerTotal-${index}`}
                          type="text"
                          className="w-full p-2 bg-gray-600 text-white rounded"
                          value={formatCurrency(item.dealerTotal, quoteData.currency)}
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
                          onBlur={() => handleBlur(index, 'listPrice')}
                          placeholder="Enter list price"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor={`salePrice-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Suggested Sale Price</label>
                        <input
                          id={`salePrice-${index}`}
                          type="text"
                          className="w-full p-2 bg-gray-600 text-white rounded"
                          value={item.salePrice}
                          onChange={(e) => handleCurrencyInput(e, index, 'salePrice')}
                          onBlur={() => handleBlur(index, 'salePrice')}
                          placeholder="Enter sale price"
                        />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <div className="relative">
                          <h3 className="text-sm font-medium text-gray-300 mb-2 text-center">
                            <span className="px-2 bg-gray-700 relative z-10">Price Adjustment</span>
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                              <div className="w-full border-t border-gray-600"></div>
                            </div>
                          </h3>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-1/2">
                            <label htmlFor={`priceAdjustmentPercentage-${index}`} className="block text-xs text-gray-400">Adjustment %</label>
                            <input
                              id={`priceAdjustmentPercentage-${index}`}
                              type="text"
                              className={`w-full p-2 bg-gray-600 text-white rounded ${parseFloat(item.priceAdjustment.percentage) < 0 ? 'text-red-500' : ''}`}
                              value={item.priceAdjustment.percentage}
                              onChange={(e) => handlePriceAdjustmentInput(e, index, 'percentage')}
                              placeholder="%"
                            />
                          </div>
                          <div className="w-1/2">
                            <label htmlFor={`priceAdjustmentAmount-${index}`} className="block text-xs text-gray-400">Adjustment $</label>
                            <input
                              id={`priceAdjustmentAmount-${index}`}
                              type="text"
                              className={`w-full p-2 bg-gray-600 text-white rounded ${parseFloat(item.priceAdjustment.amount) < 0 ? 'text-red-500' : ''}`}
                              value={item.priceAdjustment.amount}
                              onChange={(e) => handlePriceAdjustmentInput(e, index, 'amount')}
                              placeholder="Amount"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="relative">
                          <h3 className="text-sm font-medium text-gray-300 mb-2 text-center">
                            <span className="px-2 bg-gray-700 relative z-10">Profit Margins</span>
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                              <div className="w-full border-t border-gray-600"></div>
                            </div>
                          </h3>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-1/4">
                            <label htmlFor={`profitMarginAmount-${index}`} className="block text-xs text-gray-400">Amount</label>
                            <input
                              id={`profitMarginAmount-${index}`}
                              type="text"
                              className="w-full p-2 bg-gray-600 text-white rounded"
                              value={formatCurrency(item.profitMargin.amount, quoteData.currency)}
                              readOnly
                            />
                          </div>
                          <div className="w-1/4">
                            <label htmlFor={`profitMarginPercentage-${index}`} className="block text-xs text-gray-400">Percentage</label>
                            <input
                              id={`profitMarginPercentage-${index}`}
                              type="text"
                              className="w-full p-2 bg-gray-600 text-white rounded"
                              value={`${item.profitMargin.percentage.toFixed(2)}%`}
                              readOnly
                            />
                          </div>
                          <div className="w-1/2">
                            <label htmlFor={`profitMarginExtended-${index}`} className="block text-xs text-gray-400">Ext. Amount</label>
                            <input
                              id={`profitMarginExtended-${index}`}
                              type="text"
                              className="w-full p-2 bg-gray-600 text-white rounded"
                              value={formatCurrency(item.profitMargin.extendedProfit, quoteData.currency)}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {item.customsTaxes.length > 0 && (
                      <div className="mt-4">
                        <div className="relative mb-2">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-500"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-gray-700 px-2 text-sm font-medium text-gray-300">
                              Taxes
                            </span>
                          </div>
                        </div>
                        {item.customsTaxes.map((tax, taxIndex) => (
                          <div key={taxIndex} className="flex items-center gap-2 mb-2">
                            <div className="relative w-1/4">
                              <input
                                type="text"
                                placeholder="Tax %"
                                className="w-full p-2 bg-gray-600 text-white rounded"
                                value={tax.percentage}
                                onChange={(e) => handleTaxInput(e, index, taxIndex)}
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
                    )}
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
                        onChange={(e) => setQuoteData(prev => ({ ...prev, discount: e.target.value.replace(/[^0-9.,]/g, '') }))}
                        onBlur={(e) => setQuoteData(prev => ({ ...prev, discount: formatCurrency(parseFloat(e.target.value) || 0, quoteData.currency) }))}
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
                        onChange={(e) => setQuoteData(prev => ({ ...prev, shippingHandling: e.target.value.replace(/[^0-9.,]/g, '') }))}
                        onBlur={(e) => setQuoteData(prev => ({ ...prev, shippingHandling: formatCurrency(parseFloat(e.target.value) || 0, quoteData.currency) }))}
                        placeholder="Enter S&H"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-300">Final Amount Due:</span>
                    <span className="text-white">{formatCurrency(calculateFinalAmountDue(), quoteData.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit Quote
            </button>
          </form>
        </main>
      </div>
    </MainLayout>
  );
  };
  
  export default CreateQuote;