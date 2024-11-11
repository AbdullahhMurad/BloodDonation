import express from 'express';
import ejs from 'ejs';
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from 'bcrypt';
import session from 'express-session';


const port = 3000;
const app = express();

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "HopeDrops",
  password: "Alhamdulillah",
  port: 5432,
});
db.connect();

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));




app.set('view engine', 'ejs');






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
  console.log(password);
 
  try {


       const existingRecord = await db.query('SELECT * FROM donors WHERE email = $1', [email]);
     
       if (existingRecord.rows.length > 0) {
         // User with given email already exists
         res.status(400).send(`User with the email: ${email} already exists`);
        

     } else if(!existingRecord.rows.length > 0) {
         // Hash the password
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);
         
         console.log(salt);
         console.log(hashedPassword);
 
         const result = await db.query(
         "INSERT INTO DONORS (full_name, email, phone_number, password, age, blood_type, city_name) VALUES ($1, $2, $3, $4, $5, $6, $7)",
         [full_name, email, phone_number, hashedPassword, age, blood_type, city_name]);
        //  res.render("secrets");
        res.render("/register.ejs");
     }
 
  } catch (error) {
     console.log(error);
  }
 
 });

 app.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log(password);

  try {
    if (email.includes("@gmail") || email.includes("@hotmail") || email.includes("@icloud")) {
      const result = await db.query("SELECT * FROM DONORS WHERE email = $1", [email]);

      
      if (result.rows.length > 0) { // If email exists
        const donor = result.rows[0];
        const validPassword = await bcrypt.compare(password, donor.password);

        if (validPassword) { // If Password is correct
          console.log(donor.password);
          req.session.user = { email: 'user@example.com' /* Add other user details */ };

          res.redirect("home");
        } else {
          res.status(400).send('Incorrect password!');
        }



      } else {
            res.status(400).send('User does not exist');
      } 
      
    
    } else {
      res.status(400).send('Enter a valid email!');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});





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



app.get('/home', async (req, res) => {
  res.render('home.ejs', {}); // Adjust this line based on your template and data
});



// GET Routes

app.get('/', (req, res) => {
  res.render('home.ejs', { });

});
app.get('/aboutus', (req, res) => {
  res.render('aboutus.ejs', {});
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



app.get('/home', (req, res) => {
  res.render('home.ejs', {});
});

app.get('/donors.ejs', async (req, res) => {
    const defaultDonorsResult = await db.query('SELECT * FROM donors LIMIT 12');
    const defaultDonors = defaultDonorsResult.rows;
  res.render('donors.ejs', {donors: defaultDonors});
});


app.get('/login', (req, res) => {
  res.render('login.ejs', {});
});

app.get('/MyAccount', (req, res) => {
  res.render('MyAccount.ejs', {});
});

app.get('/register', (req, res) => {
  res.render('register.ejs', {});
});

app.get('/search', (req, res) => {
  res.render('search.ejs', {});
});






app.get('/forgot.ejs', (req, res) => {
  res.render('forgot.ejs', {});
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


app.get('/views/home.ejs', (req, res) => {
      res.render('home.ejs', {});
});



app.get('/views/aboutus.ejs', (req, res) => {
  res.render('aboutus.ejs', {});
});

app.get('/views/MyAccount.ejs', (req, res) => {
  res.render('MyAccount.ejs', {});
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

 
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
 