const {Router}=require('express');
const controller=require('./controller');

const router=Router();
router.get('/',controller.getStudents);

router.post("/",controller.addStudent);
router.post("/login", controller.login);

router.get("/:id",controller.getStudentById);

router.delete("/:id",controller.removeStudent);
router.put("/:id",controller.updateStudent);


module.exports=router;