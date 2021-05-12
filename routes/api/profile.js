const express =require('express');
const router=express.Router();
const auth =require('../../middleware/auth');
const {check,validationResult}=require ('express-validator');
const config =require('config');
const Profile=require('../../models/Profile');
const User =require('../../models/User');

// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private
router.get('/me', auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({
        user: req.user.id
      }).populate('user', ['name', 'avatar']);
  
      if (!profile) {
        return res.status(400).json({ msg: 'There is no profile for this user' });
      }
  
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private

router.post(
  '/',
  auth,
  check('status', 'Status is required').notEmpty(),
  check('skills', 'Skills is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
 const {
  website,
  skills,
  company,
  bio ,
  status,
  location ,
} = req.body;

  // Build Profile
  
  const profileFields ={};
  profileFields.user= req.user.id;
  if(company)   profileFields.company=company;
  if(website)   profileFields.website=website;
  if(location)  profileFields.location=location;
  if(bio)       profileFields.bio=bio;
  if(status)   profileFields.status=status;
  if(skills) {
    profileFields.skills=skills.split(',').map(skill =>skill.trim());
  } 
  console.log(profileFields.skills);
  try{
      
    let profile= await Profile.findOne({user:req.user.id})
    if(profile){
      /// update
     profile =await Profile.findOneAndUpdate(
      {user:req.user.id},
      { $set:profileFields},
      {new:true});
 return res.json(profile);
  }
    ///create
    profile=new Profile (profileFields);

    await profile.save();
    res.json(profile);

}catch(err){
 console.error(err.message);
 res.status(500).send('Server error');
  }
}
);

// @route    GET api/profile
// @desc     Get all profiles
// @access     //private       //the access will be private not public

router.get('/', auth,async(req,res)=>{
  try {
    const profiles =await Profile.find().populate( 'user',[ 'name', 'avatar']);
    res.json(profiles);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// @route    GET api/profile/user/user_id
// @desc     Get profile by user id
// @access   Public

router.get('/user/:user_id', async(req,res)=>{
  try {
    const profile =await Profile
    .findOne({ user :req.params.user_id})
    .populate( 'user',[ 'name', 'avatar']);
    
     if(!profile)  return res.status(400).json({msg: 'Profile not found'});
    res.json(profile);

  } catch (err) {
    console.error(err.message);
    if(err.kind =='ObjectId'){
      return res.status(400).json({msg: 'Profile not found'});
    }
    res.status(500).send('Server error');
  }
});

// @route    DELETE api/profile
// @desc     DELETE profile,user,post
// @access   Private

router.delete('/', auth,async(req,res)=>{
  try {
    /// @todo ===> remove user posts later
    // remove profile
    await Profile.findOneAndRemove({ user :req.user.id});
    /// remove user
    await User.findOneAndRemove({ _id :req.user.id});
    res.json({ msg :'User removed'});

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports=router;