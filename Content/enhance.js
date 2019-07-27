var enhancements = []; 
{
    enhancements.flyparameter = {
        value: 0
    };
    enhancements.drunk = {
        value:false
    };
    enhancements.push({
        code: "flyhigh",
        obj: new Drink(enhancements.flyparameter),
    });
    
    enhancements.push({
        code: "drunkrex",
        obj: new Drink(enhancements.drunk),
    });
}
var factor = 0.5;