// activities and servicess dynamic add / remove option

var max = 4;
    var x = 0;
    var y =0;
    $(document).ready(function(){
        
        var activitywrapper = (".activitywrapper");
        var servicewrapper = (".servicewrapper");
        var addActivity = (".addActivity");
        var addService = (".addService");
        
        $(addActivity).click(function(e){
            e.preventDefault();
            if(x<max){
                $(activitywrapper).append('<div><input type="text" name="activity[]" placeholder="activity" class="form-control"><a href="#" class="remove">Remove</a></div>');
                x++;
            }
        });
        $(activitywrapper).on("click",".remove", function(e){
               
            e.preventDefault(); 
            $(this).parent('div').remove(); 
            x--;
        });
        $(addService).click(function(e){
            e.preventDefault();
            if(y<max){
                $(servicewrapper).append('<div><input type="text" name="service[]" placeholder="service" class="form-control"><a href="#" class="remove">Remove</a></div>');
                y++;
            }
        });
        $(servicewrapper).on("click",".remove", function(e){
               
            e.preventDefault(); 
            $(this).parent('div').remove(); 
            y--;
        }); 
    }); 