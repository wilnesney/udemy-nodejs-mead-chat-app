//Note: Not sure about this in-memory user management...

const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room) {
        return { error: 'Username and room are required!' };
    }

    // Make sure there's not already a user with that name in the same room
    const foundUser = users.find((entry) => {
        return entry.room === room && entry.username === username;
    });

    if (foundUser) {
        return { error: 'Username already in use in this room!' };
    }

    const user = { id, username, room };
    users.push(user);
    return user;
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        const removedUser = users[index];
        // User order doesn't matter, so move last user to remove position
        // (overwriting removed user) and decrease array length by 1.
        users[index] = users[users.length - 1];
        users.pop();

        return removedUser;
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id);
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
}