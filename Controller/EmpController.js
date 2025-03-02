const Emp= require("../Model/EmpModel");

const sequelize = require("../db");
const { Op } = require("sequelize");
exports.addEmp = async (req, res) => {
  try {
   
    
    const {name,email,phoneNumber,role, joiningDate} = req.body;

    

    const newEmp= await  Emp.create({
        name,email,phoneNumber,role, joiningDate
    });

    res.status(201).json({
      message: "Employee created successfully!",
     
    });
  } catch (error) {
    console.error("Error creating emp:", error);
    res.status(500).json({
      message: "Failed to create emp. Please try again.",
      error: error.message,
    });
  }
};

exports.getEmp = async (req, res) => {
  try {
    
    const emps = await Emp.findAll(); 

    
   

    res.status(201).json(emps); 
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
