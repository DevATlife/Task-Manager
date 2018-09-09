// Initialize app
var myApp = new Framework7();
var db;

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

  var db;
/*------------- Delete Event (9)-----------------------*/
$$(document).on('deleted', '.remove-callback', function(){
  var workoutId = $$(this).attr('id');

  deleteWorkout(workoutId);
});


/*-------------------Device Ready Event ----(3)-------------*/
$$(document).on('deviceready', function() {
  
 db = window.openDatabase('workouttracker', '1.0', 'Workout Tracker', 1000000);
    createDatabase();
    getWorkouts();    
});




/*-------------------(1) add page ------------------------------------*/
myApp.onPageInit('add', function (page) {
   $$('#workout-form').on('submit', function(e){
    var data = {
      id:guidGenerator(),
      title: $$('#title').val(),
      date: $$('#date').val(),
      type: $$('#type').val(),
      length: $$('#length').val(),
    }
    
    //--- console.log(data);
    addWorkout(data);
  });
})

/*-------------(2)---------------------------------------*/
function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

/*-----------------(4)-----------------------------------------*/
function createDatabase(){
  db.transaction(createTable, function(tx, error){
    alert('DB Error: '+ error);
  },
  function(){
    console.log('Database & Table Created...');
  });
}




/*-----------------(5)-----------------------------*/
function createTable(tx){
  //tx.executeSql('DROP TABLE IF EXISTS workouts');
  tx.executeSql('CREATE TABLE IF NOT EXISTS workouts (id unique, title, date, type, length)');
}



/*-----------------------(6)-------------------------*/
function addWorkout(workout){
  db.transaction(function(tx){
    tx.executeSql('INSERT INTO workouts (id, title, date, type, length) VALUES("'+workout.id+'","'+workout.title+'","'+workout.date+'","'+workout.type+'","'+workout.length+'")');
      
  },
  function(err){
    console.log(err);
  },
  function(){
    window.location.href='index.html';
  });
}




/*-----------------------(7)---------------------------*/
function getWorkouts(){
  db.transaction(function(tx){
    tx.executeSql('SELECT * FROM workouts ORDER BY date DESC', [],
    function(tx, results){
      var len = results.rows.length;
      console.log('workouts table: '+len+' rows found');
      for(var i = 0;i < len; i++){
        $$('#workout-list').append(`
          <li class="swipeout remove-callback" id="${results.rows.item(i).id}" style="${results.rows.item(i).type}">
            <a href="details.html?id=${results.rows.item(i).id}" class="item-link swipeout-content item-content">
              <div class="item-inner">
                <div class="item-title">${results.rows.item(i).title}</div>
                <div class="item-after">${results.rows.item(i).date}</div>
              </div>
            </a>
            <div class="swipeout-actions-right">
              <a href="#" class="swipeout-delete">Delete</a>
            </div>
          </li>
        `);
      }
    },
    function(error){
      console.log(error);
    });
  });
}



/*-----------------------(8)--------------------------*/
/*--delete function need to be linked to swipeout-delete to the top ----*/
function deleteWorkout(id){
  db.transaction(function(tx){
    tx.executeSql('DELETE FROM workouts WHERE id ="'+id+'"');
  },
  function(error){
    console.log(error);
  }
);
}



/*------------------------(10)------------------------------------*/
// Details Page
myApp.onPageInit('details', function (page) {
  var workoutId = page.query.id;

  getWorkoutDetails(workoutId);
})

function getWorkoutDetails(id){
  db.transaction(function(tx){
    tx.executeSql('SELECT * FROM workouts WHERE id = "'+id+'"', [],
    function(tx, result){
      $$('#workout-details').html(`
        <div class="card">
          <div class="card-header">${result.rows[0].title}</div>
          <div class="card-content">
            <div class="card-content-inner">
           
               ${result.rows[0].length}
          
            </div>
          </div>
          <div class="card-footer">Date: ${result.rows[0].date}</div>

        </div>
      `);
    },
    function(error){
      console.log(error);
    });
  });
}



/*------------------------(11)-----------------------

myApp.onPageInit('edit', function (page) {
  var workoutId = page.query.id;

  getWorkoutEdit(workoutId);
})

function getWorkoutEdit(id){
  db.transaction(function(tx){
    tx.executeSql('SELECT * FROM workouts WHERE id = "'+id+'"', [],
    function(tx, result){
      var len = results.rows.length;
      console.log('workouts table: '+len+' rows found');
      for(var i = 0;i < len; i++){
        $$('#workout-form').append(`
<ul>
    
    <li>
      <div class="item-content">
        <div class="item-inner">
          <div class="item-title label">Title</div>
          <div class="item-input">
       
            <input type="text"  placeholder="workout title" id="title" value="${result.rows[0].title}">
          </div>
        </div>
      </div>
    </li>
      
  <!----------------date of workout ----->   
   <li>
      <div class="item-content">
        <div class="item-inner">
          <div class="item-title label">Date</div>
          <div class="item-input">
            <input type="date" placeholder="workout Date" id="date" value="${result.rows[0].date}">
          </div>
        </div>
      </div>
    </li>  
      
    <!----------------Type of workout smart selector----->   
     <li>
      <a href="#" class="item-link smart-select">
        <!-- select -->
        <select name="type" id="type">
          <option value="${result.rows[0].type}">Important</option>
          <option value="${result.rows[0].type}">Second priority</option>    
          <option value="${result.rows[0].type}">Not Important</option>
        </select>
        <div class="item-content">
          <div class="item-inner">
            <!-- Select label -->
            <div class="item-title">Workout Type</div>
            <!-- Selected value, not required prefilled -->
            <div class="item-after">Machine Weight</div>
          </div>
        </div>
      </a>
    </li>
      
    <!----------------Length of workout ----->   
    <li>
      <div class="item-content">
        <div class="item-inner">
          <div class="item-title label">Length</div>
          <div class="item-input">
            <!-- Make sure that input have "name attrobute" -->
            <input type="number"  placeholder="Length in sec" id="length" value="${result.rows[0].length}">
          </div>
        </div>
      </div>
    </li>
  </ul>
    
<br>

<div class="row">
     
  <input type="submit" value="save" class="button active jbtn">
   
    </div>

      `);
    }
    },
    function(error){
      console.log(error);
    });
  });
}


-------------*/
