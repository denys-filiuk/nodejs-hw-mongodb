import { Contact } from '../models/Contact.js';

export const getAllContacts = async (
  userId,
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  type,
  isFavourite,
) => {
  const skip = (page - 1) * perPage;
  const sortDirection = sortOrder === 'desc' ? -1 : 1;

  const sortOptions = {};
  if (sortBy) {
    sortOptions[sortBy] = sortDirection;
  }

  const filter = { userId };
  if (type) {
    filter.contactType = type;
  }
  if (typeof isFavourite !== 'undefined') {
    filter.isFavourite = isFavourite === 'true';
  }

  const [contacts, totalItems] = await Promise.all([
    Contact.find(filter).sort(sortOptions).skip(skip).limit(perPage),
    Contact.countDocuments(filter),
  ]);

  return { contacts, totalItems };
};

export const getContactById = async (userId, id) => {
  const contact = await Contact.findOne({ _id: id, userId });
  return contact;
};

export const createContact = async (contactData) => {
  const newContact = await Contact.create(contactData);
  return newContact;
};

export const updateContactById = async (userId, id, updateData) => {
  const updatedContact = await Contact.findOneAndUpdate(
    { _id: id, userId },
    updateData,
    { new: true, runValidators: true },
  );
  return updatedContact;
};

export const deleteContactById = async (userId, id) => {
  const deletedContact = await Contact.findOneAndDelete({ _id: id, userId });
  return deletedContact;
};
