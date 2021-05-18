const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const multer = require('multer');
const sharp = require('sharp');

const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

///@route  ===> POST api/users
///description ===> Register User
/// access  ===>Public

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // See if the user exits
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      // Get the Gravatar
      const avatar = gravatar.url(email, {
        // s ===> is the default size , r ===> reading  , d ===> the default
        s: '200',
        r: 'pg',
        d: 'mm', //mm refer to default image
      });
      /// here i will create instance user
      user = new User({
        name,
        email,
        password,
        avatar,
      });
      // Encrypt password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);
      // to save the user in database
      await user.save();

      //Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 60000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);
/* image */
const upload = multer({
  limits: {
    fileSize: 5000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|PNG|JPG)$/)) {
      return cb(new Error('please upload image'));
    }
    cb(undefined, true);
  },
});

// //add image-auth
// router.post(
//   '/profileImg',
//   authenticationMiddleWare,
//   upload.single('profileImage'),
//   async (req, res, next) => {
//     const buffer = await sharp(req.file.buffer)
//       .resize({ width: 250, height: 250 })
//       .png()
//       .toBuffer();
//     req.user.image = buffer;
//     await req.user.save();
//     res.send({
//       message: 'image added successfully',
//     });
//   },
//   validateImage
// );
// // //get image-auth
// router.get('/profileImg', authenticationMiddleWare, async (req, res, next) => {
//   res.set('Content-Type', 'image/png');
//   res.send(req.user.image);
// });

// //get image by id
// router.get('/profileImg/:id', async (req, res, next) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user || !user.image) {
//       return res.status(422).send({
//         error: 'user not found',
//         statusCode: 422,
//       });
//     }
//     res.set('Content-Type', 'image/jpg');
//     res.send(user.image);
//   } catch (err) {
//     res.status(400).send({
//       error: err,
//     });
//   }
// });

module.exports = router;
