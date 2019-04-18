var express = require('express'); //Ensure our express framework has been added
var app = express();
//var session = require('express-session')
//var cookieParser = require('cookie-parser')
var cors = require('cors') 
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
var jsonParser = bodyParser.json() // this is the depenency that you need to parse the requst of the form Application/Json
app.use(cors())
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
//app.use(cookieParser())

var pgp = require('pg-promise')();

const dbConfig = {
	host: 'localhost',
	port: 5432, //5432 or 3000
	database: 'research_db',
	user: 'postgres',
	password: 'newpassword' //pwd or newpassword
};

var db = pgp(dbConfig);

app.post('/student_registration',jsonParser, function(req, res, next) { 

	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.confirm_password;
	var birthday = req.body.birthday;
    var year = req.body.year;
    var major = req.body.major;

    //need to add major into the insert statement, will have to utilize the foreign key

    var unique_query = "SELECT EXISTS(SELECT 1 FROM user_profiles WHERE email='"+email+"');";
	var insert_query = "INSERT INTO user_profiles(name, email, username, password, birthday, year) " + 
                        "SELECT'"+name+"', '"+email+"','"+username+"' , '"+password+"', '"+birthday+"', '"+year+"' WHERE " +
                        "NOT EXISTS (SELECT email FROM user_profiles WHERE email = '"+email+"') " +
                        "RETURNING id;";

    var data_query = "INSERT INTO user_data(encryptId, major) " + 
                     "SELECT '"+ /*ENCRYPTID VARIABLE GOES HERE*/ +"', '" + major +"'";
                        
	db.task('get-everything', task => {
        return task.batch([
            task.any(unique_query),
            task.any(insert_query)
        ]);
    })
    .then(info => {
    	res.send({
				unique: info[0],
                id: info[1]
			})
    })
    .catch(err => {
        // display error message in case an error
        console.log(err);
        res.send({
            unique: '',
            id: ''
        })
    });
});

app.post('/researcher_registration',jsonParser, function(req, res, next) { 
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.confirm_password;
    var unique_query = "SELECT EXISTS(SELECT 1 FROM researcher_profiles where email='"+email+"');";
	var insert_query = "INSERT INTO researcher_profiles(name, email, password) " + 
                        "SELECT '"+name+"', '"+email+"', '"+password+"' WHERE " +
                        "NOT EXISTS (SELECT email FROM researcher_profiles WHERE email = '"+email+"') " +
                        "RETURNING id;";

	db.task('get-everything', task => {
        return task.batch([
            task.any(unique_query),
            task.any(insert_query)
        ]);
    })
    .then(info => {
    	res.send({
				unique: info[0],
                id: info[1]
			})
    })
    .catch(err => {
        // display error message in case an error
        console.log(err);
        res.send({
            unique: '',
            id: ''
        })
    });
});

app.post('/student_login',jsonParser, function(req, res, next) { 
	var email = req.body.email;
	var password = req.body.password;

	var validation_query = "select exists(select 1 from user_profiles where email='"+email+"' AND password='"+password+"');";
    var user_id_query = "select id from user_profiles where email='"+email+"' AND password='"+password+"';"

	db.task('get-everything', task => {
        return task.batch([
            task.any(validation_query),
            task.any(user_id_query)
        ]);
    })
    .then(info => {
    	res.send({
			inTable: info[0],
            id: info[1]
		})
    })
    .catch(err => {
        // display error message in case an error
        console.log(err);
        res.send({
            inTable: info[0],
            id: info[1]
        })
    });
});

app.post('/researcher_login',jsonParser, function(req, res, next) { 
    var email = req.body.email;
    var password = req.body.password;

    var validation_query = "select exists(select 1 from researcher_profiles where email='"+email+"' AND password='"+password+"');";
    var user_id_query = "select id from researcher_profiles where email='"+email+"' AND password='"+password+"';"

    db.task('get-everything', task => {
        return task.batch([
            task.any(validation_query),
            task.any(user_id_query)
        ]);
    })
    .then(info => {
        res.send({
            inTable: info[0],
            id: info[1]
        })
    })
    .catch(err => {
        // display error message in case an error
        console.log(err);
        res.send({
            inTable: info[0],
            id: info[1]
        })
    });
});

app.post('/load_homepage_student', jsonParser, function(req, res, next) {
    var userID = req.body.userID;

    var name_query = "select name from user_profiles where id='"+userID+"';";

    db.task('get-everything', task => {
        return task.batch([
            task.any(name_query)
        ]);
    })
    .then(info => {
        res.send({
            name: info[0]
        })
    })
    .catch(err => {
        // display error message in case an error
        console.log(err);
        res.send({
            name: info[0]
        })
    });
});

app.post('/load_homepage_researcher', jsonParser, function(req, res, next) {
    var userID = req.body.userID;

    var name_query = "select name from researcher_profiles where id='"+userID+"';";

    db.task('get-everything', task => {
        return task.batch([
            task.any(name_query)
        ]);
    })
    .then(info => {
        res.send({
            name: info[0]
        })
    })
    .catch(err => {
        // display error message in case an error
        console.log(err);
        res.send({
            name: info[0]
        })
    });
});

app.post('/post_submit',jsonParser, function(req, res, next) { 

    var title = req.body.title;
    var school = req.body.school;
    var city = req.body.city;
    var state = req.body.state;
    var zip = req.body.zip;
    var body = req.body.body;
    var major = req.body.major;
    var student_type = req.body.student_type;
    var app_open = req.body.app_open;
    var app_close = req.body.app_close;
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    var contact_name = req.body.contact_name;
    var contact_email = req.body.contact_email;
    var contact_phone = req.body.contact_phone;
    var contact_fax = req.body.contact_fax;

    var insert_query = "INSERT INTO postings (title, school, city, state, zip, body, major, app_open, app_close, " +
                        "start_date, end_date, contact_name, contact_email, contact_phone, contact_fax)" +
                        "VALUES ('"+title+"', '"+school+"', '"+city+"', '"+state+"', "+zip+", '"+body+"', '"+major+"', '"+app_open+"', '"+app_close+"', '" +
                        start_date+"', '"+end_date+"', '"+contact_name+"', '"+contact_email+"', '"+contact_phone+"', '"+contact_fax+"');";

    db.task('get-everything', task => {
        return task.batch([
            task.any(insert_query)
        ]);
    })
    .then(info => {
        res.send({
                data: ''
            })
    })
    .catch(err => {
        // display error message in case an error
        console.log(err);
        res.send({
            data: ''
        })
    });
});


app.get('/populate_feed',jsonParser, function(req, res, next) { 

    var all_postings_query = "SELECT * FROM postings;";

    db.task('get-everything', task => {
        return task.batch([
            task.any(all_postings_query)
        ]);
    })
    .then(info => {
        res.send({
                postings: info[0]
        })          
    })
    .catch(err => {
        // display error message in case an error
        console.log(err);
        res.send({
          postings: ''
        })
    });
}); 

app.post('/major_retrieve',jsonParser, function(req, res, next) {

    var query = req.body.query;

    db.task('get-majors', task => {
        return task.batch([
            task.any(query)
        ]);
    })
    .then(info => {
        res.send({
            data: [info[0][0], info[0][1], info[0][2], info[0][3]]
        })
    })
    .catch(err => {
        // display error message in case an error
        console.log(err);
        res.send({
            data: ''
        })
    });
});

app.listen(3000);
console.log('3000 is the magic port');