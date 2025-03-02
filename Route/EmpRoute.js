const { addEmp ,getEmp}= require( '../Controller/EmpController');
const express = require('express');
const router = express.Router();

router.post('/addEmp', addEmp);
router.get('/getEmp',getEmp );


module.exports = router;