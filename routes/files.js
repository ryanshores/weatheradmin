const express             = require("express"),
    router              = express.Router();

const fileUpload = require("express-fileupload");
router.use(fileUpload());

router.get("/upload", function(req, res){
	res.render("./upload");
});

router.post("/upload", function(req, res){
	if (!req.files) {
		return res.status(400).send('No files were uploaded.');
	}
	
	// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
	let sampleFile = req.files.sampleFile;
	console.log(sampleFile);
	
	return res.send("Successfully uploaded file!");
});




module.exports = router;