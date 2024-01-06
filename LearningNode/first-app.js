console.log("Welcome to eVital ...Dhwani Upadhyay");
const file_system=require('fs');    // system module (fs)
file_system.writeFileSync('file_system_write','Hi...Dhwani here');  // synchronously write data to a file
let age=25;
var first_name='Dhwani';
var last_name='Upadhyay';

age=30;

// let is new , var was old and if it is const then cannot change its value
function UserDetails(first_name,last_name,age){
    return ('Name:'+first_name+" "+last_name +" and age is "+age);
}
console.log(UserDetails(first_name,last_name,age))
console.log(age);
console.log(first_name);

const Details= (first_name,last_name,age)=>{
    return ('Name:'+first_name+" "+last_name +" and age is "+age);
}

const add=(a,b)=> a+b;
const diff =() => 7-3;
console.log(diff())

console.log(add(3,4));
console.log(Details(first_name,last_name,age))

const person={  //object
    name:'Dhwani',
    age:22,
    fun(){
        console.log(this.name+" Welcome to DA-IICT");
    }
};

person.fun();

const hobbies=['Badminton',202211045,true];

for(let hobby in hobbies){
    console.log(hobbies[hobby]);
}

console.log(hobbies.map(hobby=>'Hobby: '+hobby));
console.log(hobbies);

hobbies.push('cricket');    //reference
console.log(hobbies);

const hobbie_copy=[hobbies];
console.log(hobbie_copy);
const hobbie_copy_spread=[...hobbies];   // spread operator to pull out from the array
console.log(hobbie_copy_spread);
const hobbies_copy=hobbies.slice();


const copy_person={...person}   //SPREAD
console.log(copy_person);
console.log(hobbies_copy);

const toarr=(...args)=>{
    return args;        //REST
}

console.log(toarr(1,2,3,4,5));


const printname=({name})=>{
    console.log(name);
}
printname(person);

const {name}=person;    // destructuring
console.log(name);

const fetchdata=()=>{
    const promise=new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve('Done!');
        },1500);
    }); //constructor function
    return promise;
};

setTimeout(()=>{
    console.log('Timer done');
    fetchdata()
        .then(text=>{
            console.log(text);
            return fetchdata(); // This then block returns another call to fetchdata. This means that the next then block will wait for the Promise returned by this second fetchdata call to be resolved.
        })
        .then(text2=>{
            console.log(text2);
            return fetchdata(); 
        })
        .then(text3=>{
            console.log(text3);
            // return fetchdata(); 
        });
},2000);
console.log('hello');   // will execute first