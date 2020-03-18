const express = require('express');
const route = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const {check , validationResult} = require('express-validator');
const config = require('config');
const request = require('request');


//@route get /api/profile
//access public
//Get all profiles
route.get('/' , async (req , res) => {
    try {
      const profiles = await Profile.find().populate('profile' , ['name' , 'avatar']);
      res.json(profiles)
    }catch(err) {
        console.error(err.message);
        res.status(500).json({ msg: "Something went wrong" })
    }
  });


//@route get /api/profile/user/:user_id
//access public
//Get all profiles
route.get('/user/:user_id' , async (req , res) => {
    try {
      const uid = req.params.user_id;  
      const profile = await Profile.findOne({ user: uid }).populate('profile' , ['name' , 'avatar']);
      if(!profile) return res.status(404).json({ msg: 'No user profile found' });
      res.json(profile);
    }catch(err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" })
    }
  });

//@route get /api/profile/myprofile
//access private

route.get('/myprofile' ,auth , async (req , res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name' , 'avatar']);
    if(!profile) {
        return res.status(404).send('Not found');
    }
    res.json(profile);
    }catch(err) {
        res.status(500).send('Error occoured');
    }
});


//@route post /api/profile
//access private
//Create or update user profile
route.post('/' , auth ,
[
    check('skills' , 'Cannot Be empty').not().isEmpty(),
    check('status' , 'Cannot Be empty').not().isEmpty()
],
async (req , res) => {
    errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        company ,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        twitter,
        facebook,
        instagram,
        linkedin
    } = req.body;

    const ProfileFeilds = {}
    ProfileFeilds.user = req.user.id
    if(company) ProfileFeilds.company = company
    if(website) ProfileFeilds.website = website
    if(location) ProfileFeilds.location = location
    if(bio) ProfileFeilds.bio = bio 
    if(status) ProfileFeilds.status = status
    if(githubusername) ProfileFeilds.githubusername = githubusername
    if(skills) {
        ProfileFeilds.skills = skills.split(',').map(skills => skills.trim())
    }

    ProfileFeilds.social = {}
    if(twitter) ProfileFeilds.social.twitter = twitter
    if(youtube) ProfileFeilds.social.youtube = youtube
    if(instagram) ProfileFeilds.social.instagram = instagram
    if(facebook) ProfileFeilds.social.facebook = facebook
    if(linkedin) ProfileFeilds.social.linkedin = linkedin

    try {
        let profile = await Profile.findOne({ user: req.user.id });
        if(profile) {
            profile = await Profile.findByIdAndUpdate(
                {user: req.user.id},
                {$set : ProfileFeilds},
                {new: true}
            );
            return res.json(profile);
        }

        profile = new Profile(ProfileFeilds);
        await profile.save();
        res.json(profile)
    }catch(err) {
        console.error(err.message)
        res.status(500).json({ msg: 'Something went wrong' })
    }

});


//@route delete /api/profile
//access private
//Delete profile
route.delete('/' , auth ,  async (req , res) => {
    try {
      //delete posts

      //delete profile
      await Profile.findOneAndDelete({ user: req.user.id });
      //delete user
      await User.findOneAndDelete({ _id: req.user.id });

      res.json({ msg: "User deleted" })
    }catch(err) {
        console.error(err.message);
        res.status(500).json({ msg: "Something went wrong" })
    }
  });


//@route PUT /api/profile/experience
//access private
//Delete profile
route.put('/experience' , [auth , 
    [ 
        check('title' , 'Title is required').not().isEmpty(),
        check('company' , 'Company is required').not().isEmpty(),
        check('from' , 'From date is required').not().isEmpty()
    ]
] ,async (req , res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        title,
        company,
        from ,
        to,
        location,
        current,
        description
    } = req.body;

    const newExp = {
        title: title,
        company:company,
        from: from,
        to: to,
        description: description,
        current:current,
        location:location
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Something went wrong" })
    }
});


//@route delete /api/profile/experience/:exp_id
//access private
//Delete profile
route.delete('/experience/:exp_id' , auth , async (req ,res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        //index
        const index = profile.experience.map(item => item.id).indexOf(req.params.id);
        profile.experience.splice(index , 1);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Bad request" });
    }
});



//@route PUT /api/profile/education
//access private
//Delete profile
route.put('/education' , [auth , 
    [ 
        check('school' , 'School is required').not().isEmpty(),
        check('degree' , 'Degree is required').not().isEmpty(),
        check('from' , 'From date is required').not().isEmpty(),
        check('fieldofstudy' , 'Field of study is required').not().isEmpty()
    ]
] ,async (req , res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        school,
        degree,
        from ,
        to,
        fieldofstudy,
        current,
        description
    } = req.body;

    const newEdu = {
        school: school,
        degree:degree,
        from: from,
        to: to,
        description: description,
        current:current,
        fieldofstudy:fieldofstudy
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Something went wrong" })
    }
});


//@route delete /api/profile/education/:edu_id
//access private
//Delete profile
route.delete('/education/:edu_id' , auth , async (req ,res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        //index
        const index = profile.education.map(item => item.id).indexOf(req.params.id);
        profile.education.splice(index , 1);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Bad request" });
    }
});


//@route get /api/profile/github/:username
//access public
//fetch user from github
route.get('/github/:username', async(req , res)=>{
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecretId')}`,
            method: 'GET',
            headers: { 'user-agent': 'nodejs' }
        }

        request(options , (errors , response , body) => {
            if(errors) return res.status(500).json({ msg: 'github error' });
            if(response.statusCode !== 200) return res.status(400).json({ msg: 'No github repo found' });
            res.json(JSON.parse(body));
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Bad request" });
    }
});


module.exports = route;