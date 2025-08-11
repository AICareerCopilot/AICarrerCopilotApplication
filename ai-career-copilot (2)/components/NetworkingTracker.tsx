import React, { useState } from 'react';
import type { ResumeData, Contact, ContactStatus } from '../types';
import { generateOutreachMessage } from '../services/geminiService';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { Plus, Trash2, Wand2, Check, ClipboardCopy } from 'lucide-react';

interface NetworkingTrackerProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  resumeData: ResumeData;
}

const CONTACT_STATUS_OPTIONS: ContactStatus[] = ['To Contact', 'Contacted', 'Follow-up', 'Connected'];

const NetworkingTracker: React.FC<NetworkingTrackerProps> = ({ contacts, setContacts, resumeData }) => {
    const [newContact, setNewContact] = useState({ name: '', company: '', role: '' });
    const [generatingForId, setGeneratingForId] = useState<string | null>(null);
    const [generatedMessage, setGeneratedMessage] = useState<{ contactId: string, message: string } | null>(null);
    const [hasCopied, setHasCopied] = useState(false);

    const handleAddContact = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newContact.name || !newContact.company || !newContact.role) return;

        const newEntry: Contact = {
            id: `contact-${Date.now()}`,
            ...newContact,
            status: 'To Contact',
        };
        setContacts(prev => [newEntry, ...prev]);
        setNewContact({ name: '', company: '', role: '' });
    };

    const handleDeleteContact = (id: string) => {
        setContacts(prev => prev.filter(c => c.id !== id));
    };

    const handleUpdateStatus = (id: string, status: ContactStatus) => {
        setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    };

    const handleGenerateMessage = async (contact: Contact) => {
        setGeneratingForId(contact.id);
        setGeneratedMessage(null);
        try {
            const message = await generateOutreachMessage(resumeData, contact);
            setGeneratedMessage({ contactId: contact.id, message });
        } catch (error) {
            console.error("Failed to generate message", error);
            alert("Failed to generate message. Please try again.");
        } finally {
            setGeneratingForId(null);
        }
    };
    
    const handleCopy = () => {
        if (!generatedMessage) return;
        navigator.clipboard.writeText(generatedMessage.message);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-text-primary">Networking CRM</h1>
                <p className="text-text-secondary mt-1">Manage your professional contacts and generate outreach messages.</p>
            </div>

            <Card>
                <form onSubmit={handleAddContact} className="space-y-4">
                    <h3 className="font-semibold text-lg text-text-primary">Add New Contact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Full Name" value={newContact.name} onChange={e => setNewContact(p => ({...p, name: e.target.value}))} required />
                        <Input label="Company" value={newContact.company} onChange={e => setNewContact(p => ({...p, company: e.target.value}))} required />
                    </div>
                    <Input label="Role / Title" value={newContact.role} onChange={e => setNewContact(p => ({...p, role: e.target.value}))} required />
                    <Button type="submit" className="w-full"><Plus size={16} className="mr-2" /> Add Contact</Button>
                </form>
            </Card>

            <div className="space-y-4">
                {contacts.map(contact => (
                    <Card key={contact.id}>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                           <div>
                                <h4 className="text-lg font-bold text-text-primary">{contact.name}</h4>
                                <p className="text-sm text-text-secondary">{contact.role} at {contact.company}</p>
                           </div>
                           <div className="flex items-center gap-2 flex-shrink-0">
                                <select
                                    value={contact.status}
                                    onChange={e => handleUpdateStatus(contact.id, e.target.value as ContactStatus)}
                                    className="text-xs bg-background border border-border rounded-md px-2 py-1.5 focus:ring-accent focus:border-accent"
                                >
                                    {CONTACT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <Button 
                                    variant="secondary" 
                                    onClick={() => handleGenerateMessage(contact)} 
                                    disabled={generatingForId === contact.id}
                                    className="!p-2"
                                    title="Generate outreach message"
                                >
                                    {generatingForId === contact.id ? <Spinner size="sm" /> : <Wand2 size={16}/>}
                                </Button>
                                <Button variant="outline" onClick={() => handleDeleteContact(contact.id)} className="!p-2" title="Delete contact">
                                    <Trash2 size={16} />
                                </Button>
                           </div>
                        </div>

                        {generatedMessage && generatedMessage.contactId === contact.id && (
                            <div className="mt-4 p-4 bg-background/50 rounded-xl relative">
                                <h5 className="text-sm font-semibold text-accent mb-2">AI-Generated Outreach Message</h5>
                                <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans">
                                    {generatedMessage.message}
                                </pre>
                                <Button
                                    onClick={handleCopy}
                                    variant="secondary"
                                    className="absolute top-2 right-2 !py-1 !px-2 text-xs"
                                    >
                                    {hasCopied ? <Check size={14} className="text-green-400" /> : <ClipboardCopy size={14} />}
                                    <span className="ml-1.5">{hasCopied ? 'Copied!' : 'Copy'}</span>
                                </Button>
                            </div>
                        )}
                    </Card>
                ))}
                 {contacts.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-text-secondary">No contacts yet. Add your first contact to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NetworkingTracker;
