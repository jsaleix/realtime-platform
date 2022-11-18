const contactAdmin = (req, res) => {
    /*
        Create Converstion with a status

    */
    return res.status(201).json({ message: "Created a demand" });
};

module.exports = {
    contactAdmin
}