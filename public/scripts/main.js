var india = {
        "karnataka":
        [
            "Bagalkot",
            "Bangalore",
            "Bangalore Rural",
            "Belgaum",
            "Bellary",
            "Bidar",
            "Bijapur(KAR)",
            "Chamrajnagar",
            "Chickmagalur",
            "Chikkaballapur",
            "Chitradurga",
            "Dakshina Kannada",
            "Davangere",
            "Dharwad",
            "Gadag",
            "Gulbarga",
            "Hassan",
            "Haveri",
            "Kodagu",
            "Kolar",
            "Koppal",
            "Mandya",
            "Mysore",
            "Raichur",
            "Ramanagar",
            "Shimoga",
            "Tumkur",
            "Udupi",
            "Uttara Kannada",
            "Yadgir"
            
        ],
 "goa":["north goa", "south goa"],
 "delhi":[
    "Central Delhi",
    "East Delhi",
    "New Delhi",
    "North Delhi",
    "North East Delhi",
    "North West Delhi",
    "South Delhi",
    "South West Delhi",
    "West Delhi"
    
 ]}
    
window.onload = function () {
    var statesel = document.getElementById("state");
    var districtsel = document.getElementById("district");
    for (var state in india){
        statesel.options[statesel.options.length] = new Option(state, state);
    }
    statesel.onchange = function () {
        districtsel.length = 1;
        if(this.selectedIndex < 1)return;
        var district = india[this.value]
        for (let i=0; i<district.length; i++){
            districtsel.options[districtsel.options.length] = new Option(district[i], district[i]);
        }

    }
}

