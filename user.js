const express = require('express')
const router = express.Router()
const User = require('./model1')



router.get('/',async(req,res)=>{
   try{
    const userData = await User.find()
    res.status(200).json({data:userData})
   }catch(err){
    res.status(500).json({message:'err.message'})
   }
})

router.get('/:id',async(req,res)=>{
    try{
        console.log(req.params)
        const user = await User.findById(req.params.id)
        if(user){
            res.json({data:user})
        }else{
            res.status(404).json({message:"User not found"})
        }
    }catch(error){
        res.status(500).json({message:"err.message"})
    }
})

router.patch('/update/:id',async(req,res)=>{
    const user = await User.findById(req.params.id)
    user.userName = req.body.userName
    await user.save()
    res.status(200).json({message:"User has been updated successfully"})
})

router.post('/post',async(req,res)=>{
    console.log(req.body)
    const newUser = new User({userName:req.body.userName,collegeName:req.body.collegeName})
    await newUser.save()
    res.status(200).json({message:'A new user Created'})
})

router.delete('/delete/:id',async(req,res)=>{
    const deletedItem = await User.findOneAndDelete(req.params.id)
    res.status(200).json({data:deletedItem})
})



module.exports = router