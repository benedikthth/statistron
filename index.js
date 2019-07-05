
let functionList = []

let plainFunctionList = {}

class FunctionObject { 

    constructor(rootDiv ,inputBox, badStuffBox, delButton, colorPicker, visButton, dropdownBox, nameBox){
        this.name = ''
        this.pdf = (x=>x)
        this.plainFunc = (x=>x)
        this.errorMsg = badStuffBox; 
        this.inputBox = inputBox;
        this.delButton = delButton;
        this.rootDiv = rootDiv;
        this.colorPicker = colorPicker;
        this.visButton = visButton;
        this.nameBox = nameBox;
    // }
    
        this.color = "white"
        this.dropdownBox = dropdownBox;
        this.enabled = true;

        this.inputBox.oninput = this.handleFunctionChange.bind(this);
        this.delButton.onclick = this.delete.bind(this);
        this.colorPicker.oninput = this.handleColorChange.bind(this)
        this.visButton.onclick = this.toggleVisibility.bind(this);
        this.dropdownBox.onchange = this.dropdownBoxChange.bind(this)   
        this.nameBox.oninput = this.nameChange.bind(this);
        
    }

    nameChange(ex){
        this.name = this.nameBox.value;

    }

    dropdownBoxChange(ex){
        let selName = (this.dropdownBox.options[this.dropdownBox.selectedIndex].text)
        let template = functionPresets.filter(x=>{return x.name === selName})[0]
        this.inputBox.value = template.f
        this.handleFunctionChange()
    }

    toggleVisibility(){
        this.enabled = !this.enabled;
        if(this.enabled){
            this.visButton.classList = []
            this.visButton.classList.add('enabled')
            this.visButton.classList.add('visButton')  
            this.visButton.innerHTML = "O" 
        } else {
            this.visButton.classList = []
            this.visButton.classList.add('disabled')
            this.visButton.classList.add('visButton')  
            this.visButton.innerHTML = " _ " 
        }
    }

    

    handleColorChange(){
        // console.log(this.colorPicker.value)
        this.color = this.colorPicker.value
    }

    handleFunctionChange (){
        //remove unnamed funcs
        let funcs = functionList.filter(x=>{return x.name !== '' })
        //remove this function
        funcs = funcs.filter(x=>{return x.name !== this.name })
        //get the funcs,
        // funcs = funcs.map(x=>x.pdf)

        let prestring = `
        let sin=Math.sin;let tan=Math.tan; let cos=Math.cos
        let now=Date.now;
        let max=Math.max;let min=Math.min;
        let PI=Math.PI; let E = Math.E;
        function diff(f){ return ((x)=>{ return (f(x+0.05)-f(x-0.05))/0.1 }) }        
        `

        let fvalString = ''
        for(var i = 0; i < funcs.length; i++){
            let e = funcs[i];
            if(functionList.filter(x=>{return x.name == e.name}).length == 0){continue;}
            fvalString += `
            let ${e.name} = (
                functionList.filter(x=>{return x.name == "${e.name}"}).length !== 0 
                )? functionList.filter(x=>{return x.name == "${e.name}"})[0].pdf : undefined;
            `
        }
        // fvalString += `console.log(azz);`
        console.log(fvalString)
        
        let f =  prestring + fvalString + this.inputBox.value;
        
        // console.log(f);
        
        let somepdf = Math.sin
        let somePlainF = Math.sin
        this.errorMsg.classList = []
        this.errorMsg.classList.add('feedbackBox')

        try{
            somepdf = Function('x', f)
            somepdf(0)    
            // somePlainF(0)
            somepdf(visualizer.bounds.xMin)
            // somePlainF(visualizer.bounds.xMin)
            somepdf(visualizer.bounds.xMax)
            // somePlainF(visualizer.bounds.xMax)

        } catch(e){
            // console.log('caught');
            this.errorMsg.innerHTML = e
            this.errorMsg.classList.add('invalid')
            // console.log(e);
            return;
        }
        this.pdf = somepdf;

        this.errorMsg.innerHTML = "&#10003;";
        this.errorMsg.classList.add('valid');

    }

    delete(list) { 
        functionHolder.removeChild(this.rootDiv)
        functionList = functionList.filter(x=> { return x !== this} )
    }

}   


function init(){ 
    addFunction()
}


function addFunction(){

    let rootDiv = document.createElement('div');
    rootDiv.classList.add('functionContainer')

    let nameBox = document.createElement('input')

    let funcStartDiv =  document.createElement('div');
    let funcEndDiv =  document.createElement('div');
    funcStartDiv.innerHTML = 'function(x){'
    funcEndDiv.innerHTML = '}'
    let inputBox = document.createElement('textarea')
    let dropdownBox= document.createElement('select')
    let badStuffBox = document.createElement('span')

    badStuffBox.innerHTML = "&#10003;"

    inputBox.value = "return x"
    inputBox.rows = 10
    inputBox.cols = 40

    

    let delButton = document.createElement('button')
    delButton.classList.add('delButton')
    let visButton = document.createElement('button')
    visButton.classList.add('visButton')
    visButton.innerHTML = "O"
    visButton.classList.add('enabled')
    delButton.innerHTML = "X"

    let colorPicker = document.createElement('input')
    colorPicker.type= "color"
    colorPicker.value = "#FFFFFF"

    for(var x in functionPresets){
        
        let option = document.createElement('option')
        option.value = functionPresets[x].name
        option.innerHTML = functionPresets[x].name
        dropdownBox.appendChild(option)
    }

    funcStartDiv.appendChild(delButton )
    funcStartDiv.appendChild(colorPicker)
    funcStartDiv.appendChild(visButton)
    funcStartDiv.appendChild(nameBox)
    rootDiv.appendChild(funcStartDiv)
    rootDiv.appendChild(inputBox)
    rootDiv.appendChild(dropdownBox)
    rootDiv.appendChild(funcEndDiv)
    rootDiv.appendChild(badStuffBox)

    functionHolder.appendChild(rootDiv)

    let fObject = new FunctionObject(rootDiv, inputBox, badStuffBox, delButton, colorPicker, visButton, dropdownBox, nameBox)


    functionList.push(fObject) 

}
