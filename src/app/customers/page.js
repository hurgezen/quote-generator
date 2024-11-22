'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import AddCustomerModal from '@/components/customers/AddCustomerModal'
import AddContactModal from '@/components/contacts/AddContactModal'
import Toast from '@/components/common/Toast'
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, Users, Search } from 'lucide-react'

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      <span className="ml-3 text-gray-200">Processing...</span>
    </div>
  </div>
)

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCustomer, setExpandedCustomer] = useState(null)
  const [expandedContacts, setExpandedContacts] = useState({})
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [editFormData, setEditFormData] = useState(null)
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false)
  const [activeCompanyId, setActiveCompanyId] = useState(null)
  const [editingContact, setEditingContact] = useState(null)
  const [editContactFormData, setEditContactFormData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [isAddingContact, setIsAddingContact] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (customers.length > 0) {
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.shorthand.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCustomers(filtered)
    }
  }, [searchTerm, customers])

  const fetchCustomers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/customers')
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      const data = await response.json()
      setCustomers(data)
      setFilteredCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
      showNotification('Failed to load customers', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCustomer = async (formData) => {
    setIsAddingCustomer(true)
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        throw new Error('Failed to add customer')
      }
      const newCustomer = await response.json()
      setCustomers(prevCustomers => [...prevCustomers, newCustomer])
      showNotification('Customer added successfully', 'success')
      setIsAddModalOpen(false)
    } catch (error) {
      console.error('Failed to add customer:', error)
      showNotification('Failed to add customer', 'error')
    } finally {
      setIsAddingCustomer(false)
    }
  }

  const handleSaveContact = async (contactData) => {
    setIsAddingContact(true)
    try {
      // Ensure customerId is included in the contact data
      const contactWithCustomerId = { ...contactData, customerId: activeCompanyId }
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactWithCustomerId),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add contact')
      }
      const newContact = await response.json()
      setCustomers(prevCustomers => prevCustomers.map(customer => 
        customer.id === activeCompanyId
          ? { ...customer, contacts: [...(customer.contacts || []), newContact] }
          : customer
      ))
      showNotification('Contact added successfully', 'success')
      setIsAddContactModalOpen(false)
      setActiveCompanyId(null)
    } catch (error) {
      console.error('Failed to add contact:', error)
      showNotification(`Failed to add contact: ${error.message}`, 'error')
    } finally {
      setIsAddingContact(false)
    }
  }

  const handleEdit = (customer, e) => {
    e.stopPropagation()
    setEditingCustomer(customer.id)
    setEditFormData({ ...customer })
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    if (!editFormData.shorthand || !editFormData.name) {
      showNotification('Shorthand and Name are required', 'error')
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/customers/${editingCustomer}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update customer')
      }
      const updatedCustomer = await response.json()
      setCustomers(prevCustomers => prevCustomers.map(customer => 
        customer.id === editingCustomer ? updatedCustomer : customer
      ))
      showNotification('Customer updated successfully')
      setEditingCustomer(null)
      setEditFormData(null)
    } catch (error) {
      console.error('Failed to update customer:', error)
      showNotification(`Failed to update customer: ${error.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingCustomer(null)
    setEditFormData(null)
  }

  const handleEditContact = (contact, e) => {
    e.stopPropagation()
    setEditingContact(contact.id)
    setEditContactFormData({ ...contact })
  }

  const handleContactEditChange = (e) => {
    const { name, value } = e.target
    setEditContactFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveContactEdit = async () => {
    if (!editContactFormData.name || !editContactFormData.email) {
      showNotification('Name and Email are required', 'error')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/contacts/${editingContact}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editContactFormData),
      })
      if (!response.ok) {
        throw new Error('Failed to update contact')
      }
      const updatedContact = await response.json()
      setCustomers(prevCustomers => prevCustomers.map(customer => ({
        ...customer,
        contacts: customer.contacts && customer.contacts.map(contact => 
          contact.id === editingContact ? updatedContact : contact
        )
      })))
      showNotification('Contact updated successfully')
      setEditingContact(null)
      setEditContactFormData(null)
    } catch (error) {
      console.error('Failed to update contact:', error)
      showNotification('Failed to update contact', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCustomer = async (customer, e) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to delete customer "${customer.name}"?
This action cannot be undone and will also delete all associated contacts and quotes.`)) {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/customers/${customer.id}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to delete customer')
        }
        setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== customer.id))
        showNotification('Customer deleted successfully')
      } catch (error) {
        console.error('Failed to delete customer:', error)
        showNotification(`Failed to delete customer: ${error.message}`, 'error')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDeleteContact = async (contact, e, companyName) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to delete contact "${contact.name}" from "${companyName}"?
This action cannot be undone.`)) {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/contacts/${contact.id}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          throw new Error('Failed to delete contact')
        }
        setCustomers(prevCustomers => prevCustomers.map(customer => ({
          ...customer,
          contacts: customer.contacts && customer.contacts.filter(c => c.id !== contact.id)
        })))
        showNotification('Contact deleted successfully')
      } catch (error) {
        console.error('Failed to delete contact:', error)
        showNotification('Failed to delete contact', 'error')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
  }

  const toggleContacts = (customerId) => {
    setExpandedContacts(prev => ({
      ...prev,
      [customerId]: !prev[customerId]
    }))
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto bg-gray-800 min-h-screen p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-5xl font-bold text-blue-400">Customers</h1>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </button>
        </div>

        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-200"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="rounded-lg shadow-md bg-gray-700">
              <div 
                className={`
                  p-4 flex items-center justify-between cursor-pointer rounded-t-lg
                  ${expandedCustomer === customer.id 
                    ? 'bg-gray-600 border-gray-500' 
                    : 'bg-gray-700 hover:bg-gray-600'}
                `}
                onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}
              >
                <div className="flex items-center space-x-4">
                  {expandedCustomer === customer.id ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  }
                  <div>
                    <div className="font-semibold text-gray-200">{customer.shorthand}</div>
                    <div className="text-sm font-semibold text-blue-400">{customer.name}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex space-x-4 text-sm">
                    <span className="text-blue-400">Open: {customer.quotes?.filter(q => q.status === 'open').length || 0}</span>
                    <span className="text-green-400">Accepted: {customer.quotes?.filter(q => q.status === 'accepted').length || 0}</span>
                    <span className="text-red-400">Rejected: {customer.quotes?.filter(q => q.status === 'rejected').length || 0}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      className="p-1.5 rounded-md hover:bg-gray-500"
                      onClick={(e) => handleEdit(customer, e)}
                    >
                      <Edit className="w-4 h-4 text-blue-400" />
                    </button>
                    <button 
                      className="p-1.5 rounded-md hover:bg-gray-500"
                      onClick={(e) => handleDeleteCustomer(customer, e)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
              {expandedCustomer === customer.id && (
                <div className="bg-gray-700 border-gray-600">
                  <div className="p-4 grid grid-cols-2 gap-4 bg-gray-600">
                    {editingCustomer === customer.id ? (
                      <>
                        <div className="bg-gray-700 p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-blue-400">
                            Shorthand <span className="text-red-500">*</span>
                          </div>
                          <input
                            name="shorthand"
                            value={editFormData.shorthand}
                            onChange={handleEditChange}
                            required
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-200"
                          />
                        </div>
                        <div className="bg-gray-700 p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-blue-400">
                            Name <span className="text-red-500">*</span>
                          </div>
                          <input
                            name="name"
                            value={editFormData.name}
                            onChange={handleEditChange}
                            required
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-200"
                          />
                        </div>
                        <div className="bg-gray-700 p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-blue-400">Full Name</div>
                          <input
                            name="fullName"
                            value={editFormData.fullName || ''}
                            onChange={handleEditChange}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-200"
                          />
                        </div>
                        <div className="bg-gray-700 p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-blue-400">Address</div>
                          <input
                            name="address"
                            value={editFormData.address || ''}
                            onChange={handleEditChange}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-200"
                          />
                        </div>
                        <div className="bg-gray-700 p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-blue-400">Phone</div>
                          <input
                            name="phone"
                            value={editFormData.phone || ''}
                            onChange={handleEditChange}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-200"
                          />
                        </div>
                        <div className="bg-gray-700 p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-blue-400">Email</div>
                          <input
                            name="email"
                            value={editFormData.email || ''}
                            onChange={handleEditChange}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-200"
                          />
                        </div>
                        <div className="bg-gray-700 p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-blue-400">Website</div>
                          <input
                            name="website"
                            value={editFormData.website || ''}
                            onChange={handleEditChange}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-200"
                            placeholder="www.example.com or https://www.example.com"
                          />
                        </div>
                        <div className="bg-gray-700 p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-blue-400">VKN</div>
                          <input
                            name="vkn"
                            value={editFormData.vkn || ''}
                            onChange={handleEditChange}
                            maxLength="10"
                            pattern="\d{10}"
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-200"
                          />
                        </div>
                        <div className="bg-gray-700 p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-blue-400">VD</div>
                          <input
                            name="vd"
                            value={editFormData.vd || ''}
                            onChange={handleEditChange}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-200"
                          />
                        </div>
                        
                        <div className="col-span-2 flex justify-end space-x-3 mt-4">
                          <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-gray-400 hover:text-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Save Changes
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-gray-700 p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-blue-400">Full Name</div>
                          <div className="text-gray-300 font-semibold">{customer.fullName}</div>
                        </div>
                        <div className="bg-gray-700 p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-blue-400">Address</div>
                          <div className="text-gray-300 font-semibold">{customer.address}</div>
                        </div>
                        <div className="bg-gray-700 p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-blue-400">Phone</div>
                          <div className="text-gray-300 font-semibold">{customer.phone}</div>
                        </div>
                        <div className="bg-gray-700 p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-blue-400">Email</div>
                          <div className="text-gray-300 font-semibold">{customer.email}</div>
                        </div>
                        <div className="bg-gray-700 p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-blue-400">Website</div>
                          <div className="text-gray-300 font-semibold">{customer.website}</div>
                        </div>
                        <div className="bg-gray-700 p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-blue-400">VKN</div>
                          <div className="text-gray-300 font-semibold">{customer.vkn}</div>
                        </div>
                        <div className="bg-gray-700 p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-blue-400">VD</div>
                          <div className="text-gray-300 font-semibold">{customer.vd}</div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-4 border-gray-600">
                    <div 
                      className="flex items-center justify-between cursor-pointer bg-gray-700 p-3 rounded-lg hover:bg-gray-600"
                      onClick={() => toggleContacts(customer.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold text-blue-400">Contacts ({customer.contacts?.length || 0})</span>
                      </div>
                      <button 
                        className="text-sm bg-blue-600 text-gray-200 px-3 py-1.5 rounded-md hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveCompanyId(customer.id)
                          setIsAddContactModalOpen(true)
                        }}
                      >
                        Add Contact
                      </button>
                    </div>

                    {expandedContacts[customer.id] && (
                      <div className="mt-3 space-y-2 pl-4">
                        {customer.contacts && customer.contacts.length > 0 ? (
                          customer.contacts.map((contact) => (
                            <div 
                              key={contact.id} 
                              className="bg-gray-700 p-4 rounded-lg border-t border-gray-600 hover:bg-gray-600"
                            >
                              <div className="flex justify-between items-start">
                                {editingContact === contact.id ? (
                                  <div className="w-full">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <div className="text-sm font-medium text-blue-400">
                                          Name <span className="text-red-500">*</span>
                                        </div>
                                        <input
                                          name="name"
                                          value={editContactFormData.name}
                                          onChange={handleContactEditChange}
                                          required
                                          className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-200"
                                        />
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-blue-400">
                                          Email <span className="text-red-500">*</span>
                                        </div>
                                        <input
                                          name="email"
                                          type="email"
                                          value={editContactFormData.email}
                                          onChange={handleContactEditChange}
                                          required
                                          className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-200"
                                        />
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-blue-400">Position</div>
                                        <input
                                          name="position"
                                          value={editContactFormData.position || ''}
                                          onChange={handleContactEditChange}
                                          className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-200"
                                        />
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-blue-400">Phone</div>
                                        <input
                                          name="phone"
                                          value={editContactFormData.phone || ''}
                                          onChange={handleContactEditChange}
                                          className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-200"
                                        />
                                      </div>
                                      <div className="col-span-2">
                                        <div className="text-sm font-medium text-blue-400">Address</div>
                                        <input
                                          name="address"
                                          value={editContactFormData.address || ''}
                                          onChange={handleContactEditChange}
                                          className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-200"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex justify-end space-x-3 mt-4">
                                      <button
                                        onClick={() => {
                                          setEditingContact(null)
                                          setEditContactFormData(null)
                                        }}
                                        className="px-4 py-2 text-gray-400 hover:text-gray-200"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={handleSaveContactEdit}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                      >
                                        Save Changes
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div>
                                      <div className="text-gray-200 font-semibold border-b border-gray-500">{contact.name}</div>
                                      <div className="text-sm text-blue-400">{contact.position}</div>
                                      <div className="text-sm text-gray-400 mt-1">{contact.email}</div>
                                      <div className="text-sm text-gray-400">{contact.phone}</div>
                                      <div className="text-sm text-gray-400">{contact.address}</div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <button 
                                        className="p-1.5 rounded-md hover:bg-gray-500"
                                        onClick={(e) => handleEditContact(contact, e)}
                                      >
                                        <Edit className="w-4 h-4 text-blue-400" />
                                      </button>
                                      <button 
                                        className="p-1.5 rounded-md hover:bg-gray-500"
                                        onClick={(e) => handleDeleteContact(contact, e, customer.name)}
                                      >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400 italic">No contacts found for this customer.</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {isLoading && <LoadingOverlay />}
    
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}  
      <AddCustomerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleSaveCustomer}
        isAddingCustomer={isAddingCustomer}
        setIsAddingCustomer={setIsAddingCustomer}
      />
      <AddContactModal 
        isOpen={isAddContactModalOpen} 
        onClose={() => {
          setIsAddContactModalOpen(false);
          setActiveCompanyId(null);
        }}
        onSave={handleSaveContact}
        customerId={activeCompanyId}
        isAddingContact={isAddingContact}
        setIsAddingContact={setIsAddingContact}
      />
    </MainLayout>
  )
}