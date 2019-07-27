var Drink = function(drinkObj){
    this.IsActive = false;
    this.DrinkObj = drinkObj;
};
Drink.prototype.Toggle = function(){
    if(this.IsActive){
        this.Disable();
    }
    else{
        this.Enable();
    }
};


Drink.prototype.Enable = function(){
    this.DrinkObj.value = true;
    this.IsActive = true;
};
Drink.prototype.Disable = function(){
    this.DrinkObj.value = false;
    this.IsActive = false;
};