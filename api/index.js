module.exports = (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(JSON.stringify({ response: 'hello from the /api/ route' }));
};
