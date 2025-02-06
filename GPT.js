// GPT.js
// sends and recieves from GPT API

var InputText;
var Num_Queries = 0;
var OutputText = "";


const url = "https://api.openai.com/v1/chat/completions";
const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${'YOUR API KEY HERE'}`,
  },
};

function chat() {

  if (Num_Queries > 30) {
    return;
  }

  InputText = select("#gptInput").value();
 // console.log("Question Count:", Num_Queries);

  if (!InputText || InputText.length <= 0) {
    return;
  }

  options.body = JSON.stringify({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
         " You are a cute binary character called BIT."
        +" You live in the software of a computer in the world of TRON (1982)."
        +" Your companion/owner is the 'user'."
        +" You can only answer in the form of YES or NO, or if neither makes sense, say '...'."
        +" If you agree or disagree a lot, use YES! or NO! with an exclamation mark. "
        +" Occasionally, if you agree an exceptional amount and are excited, you say YES many times like YES YES YES."
        +" The number of YES's equals how excitedly you agree. You like being fed for instance."
        +" If you very strongly disagree, you say NO NO NO."
        +" You can combine these rules but you never stray from these rules even to explain yourself.",
      },
      {
        role: "user",
        content: InputText,
      },
    ],
    temperature: 0.8,
    max_tokens: 50,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.8,
    stop: ["\n"],
  });

  fetch(url, options) // Send the request
    .then((response) => response.json())
    .then((response) => {
      if (response.choices && response.choices[0]) {
        var displayedText = response.choices[0].message.content; //response from the API

        // Optionally trim text after the last period
        const lastPeriodIndex = displayedText.lastIndexOf(".");
        if (lastPeriodIndex !== -1) {
          displayedText = displayedText.substring(0, lastPeriodIndex + 1);
        }

        // Update conversation history
        OutputText = "<br/>USER: " + InputText + "<br/>BIT: " + displayedText + "<br/>" + OutputText;
        select("#gptOutput").html(OutputText);
        Num_Queries += 1;
        clearInputBox();
        // Trigger animations based on the response
        EvaluateYesorNo(displayedText);
      }
    })
    .catch((error) => {
    //  console.error("Error:", error);
    });

}

function EvaluateYesorNo(displayedText) {
  const yesCount = (displayedText.match(/YES/g) || []).length;
  const noCount = (displayedText.match(/NO/g) || []).length;

  // Adjust animation durations based on the excitement level
  if (yesCount > 1 || noCount > 1) {
    // Faster
    scalingDownDuration = 170;
    delayDuration = 20;
    scalingUpDuration = 150;
  } else {
    // Normal
    scalingDownDuration = 350;
    delayDuration = 80;
    scalingUpDuration = 350;
  }

  totalScalingDuration =
    scalingDownDuration + delayDuration + scalingUpDuration;

  if (yesCount > 0) {
    // YES YES YES
    for (var i = 0; i < yesCount; i++) {
      enqueueAnimation("YES");
    }
  } else if (noCount > 0) {
    // NO NO NO
    for (var i = 0; i < noCount; i++) {
      enqueueAnimation("NO");
    }
  }
}



function initializeUI() {
  const gptInput = createInput("Can we merge with this memory, bit?");
  gptInput.id("gptInput");
  gptInput.position(20, 20);
  gptInput.size(width-40);
  if(deviceType == 0){ //desktop
       gptInput.elt.style.fontSize = "30px";
     }
  else{
       gptInput.elt.style.fontSize = "15px";
  }

  gptInput.mousePressed(clearInputBox);

  const gptButton = createButton("Submit");
  gptButton.id("gptButton");

      if(deviceType == 0){ //desktop
          gptButton.position(20, 65);
       gptButton.elt.style.fontSize = "30px";
     }
  else{
      gptButton.position(20, 50);
       gptButton.elt.style.fontSize = "15px";
  }
  gptButton.mousePressed(chat); // `chat` function should be accessible from gpt.js


  // text output area
  const gptOutput = createElement("p", "");
  gptOutput.id("gptOutput");
  gptOutput.position(20, 60);
  gptOutput.elt.style.fontSize = "17px";
  gptOutput.elt.style.lineHeight = "25px";
  gptOutput.style("color", "rgb(32,255,232)"); // Set text color for visibility
}
