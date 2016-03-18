module.exports = function(request){
    this.get = function(){
        return null;
    };
    this.post = function(){

        return {
            redirect: '/'
        }
    };
}