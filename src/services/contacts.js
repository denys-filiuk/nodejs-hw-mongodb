import { Contact } from '../models/Contact.js';

export const getAllContacts = async () => {
  const contacts = await Contact.find();
  return contacts;
};

export const getContactById = async (id) => {
  const contact = await Contact.findById(id);
  return contact;
};

export const createContact = async (contactData) => {
  const newContact = await Contact.create(contactData);
  return newContact;
};

export const updateContactById = async (id, updateData) => {
  const updatedContact = await Contact.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  return updatedContact;
};

export const deleteContactById = async (id) => {
  const deletedContact = await Contact.findByIdAndDelete(id);
  return deletedContact;
};
