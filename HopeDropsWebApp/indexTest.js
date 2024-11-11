import express from 'express';
import ejs from 'ejs';
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from "passport";
import { Strategy } from "passport-local";
import { body, validationResult } from 'express-validator';

// Passport module must gp after the session initialization

// express session allows us to set up a new session to start saving user login sessions
// its app.use is a middleware  



const port = 3000;
const app = express();
const saltRounds = 10;



// app.use(session({
//   secret: 'your-secret-key',
//   resave: false,
//   saveUninitialized: true
// }));

app.use(session({
  secret: "AbdullahSufyanMuradFreePalestine",
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true }
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
  }
}));

app.use(passport.initialize());
app.use(passport.session());



app.use(cookieParser());

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "HopeDrops",
  password: "Alhamdulillah",
  port: 5432,
});
db.connect();

app.set('view engine', 'ejs');


// The backend was built by Abdullah Sufyan Murad
// I built the database in Postgres, wrote the backend in Node.js, Express.js, EJS, and assisted in engineering
// the Frontend.
// Al Zaytoonah University Of Jordan
// 2020 - 2024
// My github account: https://github.com/AbdullahhMurad/BloodDonationWebApp


// Step 1: Organize the directories

// Step 2: Create the GET routes in order to be able to navigate between the pages and connect the frontend
// with the backend

// Step 3: Convert the html files into ejs, just in case

// Step 4: Starting with the register.ejs, serve the page in the backend, render the ejs, and pass the objects

// Step 5: For form tags, use buttons instead of anchor tags

// Step 6: Add Validation Rules

// Validation Rules have been implemented, revise the MyAccount.ejs page, why is there no button? How will the changes be saved?

// Step 7: Create separate files for the header, footer, and statistics, and include them in each ejs file

// Since we used the ejs tag include, the website seems to be more dynamic

// Step 8: I have successfully created the post route for the register.ejs, data gets inserted successfully,
//         but the user is not being directed to the home page

// lol, the user was not being directed to the home page because of the order of the routes
// order matters in express

// Dynamically displayed donors information that match the user criteria in the Donors Page and Search Page

// Imported bcrypt to encrypt and hash the passwords

// Added columns called birthdate and age in the donors table in the database
// Added an age field in the register.ejs
// Added a validation rule for the age field, The minimum age is 18
// Added the age property in the node js code


// What is left for me to do is add the WhatsApp API and other API's
// And I must add authentication and authorization for a loggedin role
// When the user is logged in, their information will automatically be displayed whenever they visit the
// MyAccount page in case they want to update their information







app.use('/public',express.static('public'));


// app.engine('html', ejs.renderFile);
app.engine('ejs', ejs.renderFile);

// Make sure you place this after initializing the app
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());






const getBloodTypeText = (bloodType) => {
  // Optionally, you can check if the blood type is one of the expected values
  const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  if (validBloodTypes.includes(bloodType)) {
      return bloodType;
  } else {
    return 'Unknown Blood Type';
  }
};













app.post('/views/search.ejs', async (req, res) => {
  try {

    const { city } = req.body;
    console.log('City:', city)
    
    let query = 'SELECT * FROM HOSPITALS WHERE city = $1';
    const params = [city];

    const hospitalsResult = await db.query(query, params);
    const hospitals = hospitalsResult.rows;

    res.render('search.ejs', { hospitals: hospitals, city: city });

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
  
});


app.post('/forgot', async (req, res) => {

  const email = req.body.email;

  console.log(email);

  res.send(`A code has been sent to ${email}`);

});











app.post('/register', async (req, res)=> {
 
  const full_name = req.body.full_name;
  const email = req.body.email; 
  const phone_number = req.body.phone_number;
  const password = req.body.password;
  const age = req.body.age;
  const blood_type = req.body.blood_type;
  const city_name = req.body.city;


  console.log(full_name);
  console.log(email);
  console.log(phone_number);
  console.log(password);
  console.log(age);
  console.log(blood_type);
  console.log(city_name);

  

  
 
  try {
       const checkResult = await db.query('SELECT * FROM donors WHERE email = $1', [email]);
       if (checkResult.rows.length > 0) {
         // User with given email already exists
         res.send(`User with the email: ${email} already exists`);
     } else {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err){
              console.error("Error hashing password:", err);
            } else {
              console.log("Hashed Password:", hash);
               const result = await db.query(
                "INSERT INTO DONORS (full_name, email, phone_number, password, age, blood_type, city_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
                [full_name, email, phone_number, hash, age, blood_type, city_name]
                );           
                
                const donor = result.rows[0];
                req.login(donor, (err) => {
                console.log("success");
                res.redirect("/views/aboutus.ejs");
        });
     }
    });  
}
} catch (err) {
     console.log(err);
  }
 
 });

//  app.get('/views/MyAccount.ejs', (req, res) => {
//   res.render('MyAccount.ejs', {});
// });


 app.get("/views/MyAccount.ejs", (req, res) => {
  // console.log(req.user);
  if (req.isAuthenticated()) {
    console.log("User is Authenticated", req.donor);
    res.render("MyAccount.ejs");
  } else {
    console.log("User is not Authenticated");
    res.redirect("/login");
  }
});
app.post(
  '/login',
  [
    body('email').custom((value) => {
      if (!value.includes('@gmail') && !value.includes('@hotmail') && !value.includes('@icloud')) {
        throw new Error('Invalid email domain. Only Gmail, Hotmail, and iCloud domains are allowed.');
      }
      return true; // Indicates validation success
    }),
    body('password').notEmpty(),
  ],
  async (req, res, next) => {
    // Validate the request using express-validator
   

    // Authenticate user using passport-local strategy
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }

      // Check if authentication failed
      if (!user) {
        // return res.status(401).send('Incorrect email or password');
        // res.redirect("/home")
        res.render("MyAccount.ejs")
      } else {
        // req.redirect("/home");
        bcrypt.compare(req.body.password, user.password, (bcryptErr, result) => {
          if (bcryptErr) {
            return next(bcryptErr);
          }
      

      // Authentication successful, check if password is correct
     

        

        // Password is correct, log in the user and redirect to MyAccount
        req.login(user, (loginErr) => {
          if (loginErr) {
            return next(loginErr);
          }
          return res.redirect('/views/MyAccount');
        });
      });
    }
    })(req, res, next);
  }
);



// app.post(
//   '/login',
//   [
//     body('email').custom((value) => {

//       if(!value.includes('@gmail')){
//         res.send("Enter a valid email")
//       }
//       if(!value.includes('@hotmail')){
//         res.send("Enter a valid email")
//       }
//       if(!value.includes('@icloud')){
//         res.send("Enter a valid email")
//       }
      
//       return true; // Indicates validation success
//     }),
//     body('password').notEmpty(),
//   ],
//   async (req, res) => {
//     // Validate the request using express-validator
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).send("Enter a valid email");
//     }

//     passport.authenticate('local', {
//       successRedirect: '/views/MyAccount',
//       failureRedirect: '/login',
//     })(req, res);
//   }
// );




// app.post(
//   "/login",
//   passport.authenticate("local", {
//     successRedirect: "/views/MyAccount",
//     failureRedirect: "/login",
//   })
// );



app.post('/views/donors', async (req, res) => {
  try {
    const { bloodType, city } = req.body;
    console.log('Blood Type:', bloodType);
    console.log('City:', city);

    // Added ILIKE for case insensitivity
    // ILIKE = is a syntax error
    let query = 'SELECT * FROM donors WHERE city_name ILIKE $1';
    const params = [city];

    if (bloodType) {
      const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
      const bloodTypeIndex = bloodTypes.indexOf(bloodType);
      
      if (bloodTypeIndex !== -1) {
        const compatibleBloodTypes = getCompatibleBloodTypes(bloodType);
        query += ` AND blood_type IN (${compatibleBloodTypes.map((_, i) => `$${i + 2}`).join(', ')})`;
        params.push(...compatibleBloodTypes);
      }
    }

    console.log('SQL Query:', query);
    console.log('Parameters:', params);

    const donorsResult = await db.query(query, params);
    const donors = donorsResult.rows;

    // Render the donors.ejs view
    res.render('donors.ejs', { blood_type: bloodType, city_name: city, donors: donors, getBloodTypeText: getBloodTypeText });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
  
});

// Function to get compatible blood types
const getCompatibleBloodTypes = (selectedBloodType) => {
  const bloodTypeMap = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    'AB-': ['A-', 'B-', 'O-', 'AB-']
  };

  return bloodTypeMap[selectedBloodType] || [];
};

// The variable is never read, so this statement might get deleted
const bloodTypeMapping = {
  1: 'A+',
  2: 'A-',
  3: 'B+',
  4: 'B-',
  5: 'AB+',
  6: 'AB-',
  7: 'O+',
  8: 'O-',
};









//Test
app.get('/donors', async (req, res) => {
  try {
    // Query the database to get distinct blood types
    const bloodTypesResult = await db.query('SELECT DISTINCT blood_type FROM donors');
    const bloodTypes = bloodTypesResult.rows;

    // Query the database to get all cities
   
    const citiesResult = await db.query('SELECT * FROM city');
    // const citiesResult = await db.query('SELECT city_name from donors')
    const cities = citiesResult.rows;

    // Query the database to get a default set of 12 donors
    // Make sure the limit is 12 or a closer number to that amount to display donors informaion by default 
    // prior to the users request
    const defaultDonorsResult = await db.query('SELECT * FROM donors LIMIT 12');
    const defaultDonors = defaultDonorsResult.rows;

    // Render the donors.ejs view and pass the blood types, cities, and default donors as variables
    res.render('donors.ejs', { blood_type: bloodTypes, city: cities, donors: defaultDonors, getBloodTypeText: getBloodTypeText, getCompatibleBloodTypes: getCompatibleBloodTypes});
  } catch (error) {
    console.error('Error fetching data:', error);
    // Handle other errors if needed
    res.status(500).send('Internal Server Error');
  }
});














// GET Routes

app.get('/', (req, res) => {
  res.render('home.ejs', { });

});



app.get('/donors',  async (req, res) => {
  try {
    // Query the database to get distinct blood types
    const bloodTypesResult = await db.query('SELECT DISTINCT blood_type FROM donors');
    const bloodTypes = bloodTypesResult.rows;

    // Query the database to get all cities
   
    const citiesResult = await db.query('SELECT * FROM city');
    // const citiesResult = await db.query('SELECT city_name from donors')
    const cities = citiesResult.rows;

    // Query the database to get a default set of 12 donors
    // Make sure the limit is 12 or a closer number to that amount to display donors informaion by default 
    // prior to the users request
    const defaultDonorsResult = await db.query('SELECT * FROM donors LIMIT 12');
    const defaultDonors = defaultDonorsResult.rows;

    // Render the donors.ejs view and pass the blood types, cities, and default donors as variables
    res.render('donors.ejs', { blood_type: bloodTypes, city: cities, donors: defaultDonors, getBloodTypeText: getBloodTypeText, getCompatibleBloodTypes: getCompatibleBloodTypes});
  } catch (error) {
    console.error('Error fetching data:', error);
    // Handle other errors if needed
    res.status(500).send('Internal Server Error');
  }
});




app.get('/donors.ejs', async (req, res) => {
    const defaultDonorsResult = await db.query('SELECT * FROM donors LIMIT 12');
    const defaultDonors = defaultDonorsResult.rows;
  res.render('donors.ejs', {donors: defaultDonors});
});


app.get('/login', (req, res) => {
  res.render('login.ejs', {});
});


// Update Account  POST Route

app.post('/updateAccount', async (req, res) => {
  try {
    const donorId = req.donor.id; // Assuming your user object has an 'id' property
    const { full_name, email, phone_number, age, blood_type, city_name, password } = req.body;

    // Update the user data in the database
    const result = await db.query(
      'UPDATE donors SET full_name = $1, email = $2, phone_number = $3, age = $4, blood_type = $5, city_name = $6, password = $7 WHERE id = $8 RETURNING *',
      [full_name, email, phone_number, age, blood_type, city_name, password, donorId]
    );

    const updatedDonor = result.rows[0];

    // Update the user data in the session
    req.login(updatedDonor, (err) => {
      if (err) {
        console.error('Error updating user session:', err);
      }
    });

    // Redirect to the MyAccount page with a success message
    res.redirect('/MyAccount?success=true');
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).send('Internal Server Error');
  }
});




app.get('/views/forgot.ejs', (req, res) => {
  res.render('forgot.ejs', {});
});





// Test

app.get('/views/home.ejs', (req, res) => {
  res.render('home.ejs', {});
});


// I forgot to add the .ejs in the get route, which caused the page not to be rendered and displayed
app.get('/views/donors.ejs',  async (req, res) => {
  try {
    // Query the database to get distinct blood types
    const bloodTypesResult = await db.query('SELECT DISTINCT blood_type FROM donors');
    const bloodTypes = bloodTypesResult.rows;

    // Query the database to get all cities
   
    const citiesResult = await db.query('SELECT * FROM city');
    // const citiesResult = await db.query('SELECT city_name from donors')
    const cities = citiesResult.rows;

    // Query the database to get a default set of 12 donors
    // Make sure the limit is 12 or a closer number to that amount to display donors informaion by default 
    // prior to the users request
    const defaultDonorsResult = await db.query('SELECT * FROM donors LIMIT 12');
    const defaultDonors = defaultDonorsResult.rows;

    // Render the donors.ejs view and pass the blood types, cities, and default donors as variables
    res.render('donors.ejs', { blood_type: bloodTypes, city: cities, donors: defaultDonors, getBloodTypeText: getBloodTypeText, getCompatibleBloodTypes: getCompatibleBloodTypes});
  } catch (error) {
    console.error('Error fetching data:', error);
    // Handle other errors if needed
    res.status(500).send('Internal Server Error');
  }

});

app.get('/views/home.ejs', (req, res) => {
  res.render('home.ejs', {});
});




app.get('/views/aboutus.ejs', (req, res) => {
  res.render('aboutus.ejs', {});
});



app.get('/views/register.ejs', (req, res) => {
  res.render('register.ejs', {});
});

app.get('/views/login.ejs', (req, res) => {
  res.render('login.ejs', {});
});

app.get('/views/search.ejs', (req, res) => {
  res.render('search.ejs', {hospitals: 0});
});


passport.use(new Strategy( async function verify(email, password, cb){
console.log("Passport.use email:",email);
console.log("Verifying User:" +email)

    try {

      const result = await db.query("SELECT * FROM DONORS WHERE email = $1", [email]);
      if (result.rows.length > 0){
        const donor = result.rows[0];
        const storedHashedPassword = donor.password;
        bcrypt.compare(password, storedHashedPassword, (err, result) => {
          if(err){
            // console.error("Error comparing passwords");
            return cb(err);
          } else{
            if (result){
              // res.render("/views/MyAccount.ejs");
              return cb(null, donor)
            } else {
              // res.send("Incorrect password");
              return cb(null, false)
            }
          }
        });
      } else {
        // res.send("User not found")
        return cb("User not found")
      }
      
    } catch (error) {
      return cb(err)
    }


}));
 
app.post("/MyAccount" , async (req,res) => {

    const existingRow = await db.query("SELECT * FROM DONORS WHERE donor_id = $1");

    console.log(existingRow[0]);

      // <script>   alert("Test");  </script>

    // alert("Test");

});

app.post('/updateAccount', async (req, res) => {
  try {
    const donorId = req.donor.id; // Assuming your user object has an 'id' property
    const { full_name, email, phone_number, age, blood_type, city_name, password } = req.body;

    // Update the user data in the database
    const result = await db.query(
      'UPDATE donors SET full_name = $1, email = $2, phone_number = $3, age = $4, blood_type = $5, city_name = $6, password = $7 WHERE id = $8 RETURNING *',
      [full_name, email, phone_number, age, blood_type, city_name, password, donorId]
    );

    const updatedDonor = result.rows[0];

    // Update the user data in the session
    req.login(updatedDonor, (err) => {
      if (err) {
        console.error('Error updating user session:', err);
      }
    });

    // Redirect to the MyAccount page with a success message
    res.redirect('/MyAccount?success=true');
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).send('Internal Server Error');
  }
});




// passport.serializeUser((donor, cb) => {
//   cb(null, donor.id);
// }); 


// passport.deserializeUser(async (id, cb) => {
//   try {
//     const result = await db.query("SELECT * FROM DONORS WHERE id = $1", [id]);
//     const donor = result.rows[0];
//     cb(null, donor);
//   } catch (error) {
//     cb(error);
//   }
// });


// passport.deserializeUser((user, cb) => {
//   cb(null, user);
// }); 


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
 