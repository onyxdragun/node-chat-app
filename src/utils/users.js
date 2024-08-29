const users = [];

const addUser = ({id, username, room}) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and Room are required'
        }
    }
    
    // Check for existing user
    const existingUsers = users.find((user) => {
        return user.room === room && user.username === username;
    });

    // Validate username
    if (existingUsers) {
        return {
            error: 'Username already exists'
        }
    }

    // Store user
    const user = { id, username, room};
    users.push(user);
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    });

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => {
        return user.id === id;
    });
}

const getUsersInRoom = (room) => {
    return users.filter((user) => {
        return user.room === room;
    });
}

export {addUser, removeUser, getUser, getUsersInRoom}