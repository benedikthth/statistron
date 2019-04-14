
reflexor = {mean:0/* empty object, */}

let functionList = []

class FunctionObject { 

    constructor(rootDiv ,inputBox, badStuffBox, delButton, colorPicker, visButton){
        this.pdf = (x=>x)
        this.errorMsg = badStuffBox; 
        this.inputBox = inputBox;
        this.delButton = delButton;
        this.rootDiv = rootDiv;
        this.colorPicker = colorPicker;
        this.visButton = visButton;
        this.color = "white"

        this.enabled = true;

        this.inputBox.oninput = this.handleFunctionChange.bind(this);
        this.delButton.onclick = this.delete.bind(this);
        this.colorPicker.oninput = this.handleColorChange.bind(this)
        this.visButton.onclick = this.toggleVisibility.bind(this);
        
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
            
        let f = 'let sin=Math.sin;let now=Date.now;let max=Math.max;let PI=Math.PI;let min=Math.min;' + this.inputBox.value;
        let somepdf = Math.sin
        try{
            somepdf = Function('x', f)
            somepdf(0)    
        } catch(e){
            // console.log('caught');
            this.errorMsg.innerHTML = e
            // console.log(e);
            return;
        }
        this.pdf = somepdf
        this.errorMsg.innerHTML = ""

    }

    delete(list) { 
        functionHolder.removeChild(this.rootDiv)
        functionList = functionList.filter(x=> { return x !== this} )
    }

}   


function init(){ 
    addFunction()
    addFunction()
}


function addFunction(){
    
    let rootDiv = document.createElement('div');
    rootDiv.classList.add('functionContainer')


    let funcStartDiv =  document.createElement('div');
    let funcEndDiv =  document.createElement('div');
    funcStartDiv.innerHTML = 'function(x){'
    funcEndDiv.innerHTML = '}'
    let inputBox = document.createElement('textarea')
    let badStuffBox = document.createElement('span')
    badStuffBox.style="color: red"

    inputBox.value = "return x"
    inputBox.rows = 10
    inputBox.cols = 20

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



    funcStartDiv.appendChild(delButton )
    funcStartDiv.appendChild(colorPicker)
    funcStartDiv.appendChild(visButton)

    rootDiv.appendChild(funcStartDiv)
    rootDiv.appendChild(inputBox)
    rootDiv.appendChild(funcEndDiv)
    rootDiv.appendChild(badStuffBox)

    functionHolder.appendChild(rootDiv)

    let fObject = new FunctionObject(rootDiv, inputBox, badStuffBox, delButton, colorPicker, visButton)


    functionList.push(fObject) 

}
