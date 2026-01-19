export const getSender = (loggedUser: any, users: any[]) => {
  // If the first user in the array is NOT the logged in user, return that user's name
  // Otherwise, return the second user's name
  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
};