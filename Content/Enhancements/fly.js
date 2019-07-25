var Fly = function(flyObj){
    this.IsActive = false;
    this.FlyObj = flyObj;
};
Fly.prototype.Toggle = function(){
    if(this.IsActive){
        this.Disable();
    }
    else{
        this.Enable();
    }
};


Fly.prototype.Enable = function(){
    this.FlyObj.value = 2;
    this.IsActive = true;
};
Fly.prototype.Disable = function(){
    this.FlyObj.value = 0;
    this.IsActive = false;
};