const indexCtrl = {};

indexCtrl.index = async(req, res) =>{
    res.json({"message": "keep-alive"})
};

module.exports = indexCtrl;