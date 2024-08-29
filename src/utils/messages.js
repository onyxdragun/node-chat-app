const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
};

const generateLocation = (username, location) => {
    return {
        username,
        url: location,
        createdAt: new Date().getTime()
    }
};

export {generateMessage, generateLocation}