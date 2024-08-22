const kWeekendColor = "#d19847";
const dF = new DateFormatter();

let widget = new ListWidget();
widget.backgroundColor = new Color("#ffffff");

let mainStack = widget.addStack();
mainStack.layoutHorizontally();

let leftStack = mainStack.addStack();
leftStack.layoutVertically();
leftStack.size = new Size(160, 150);
leftStack.borderWidth = 1;
leftStack.borderColor = new Color("#FF9500");

let spacer = mainStack.addSpacer(20);

let rightStack = mainStack.addStack();
rightStack.layoutVertically();
rightStack.size = new Size(160, 0);
rightStack.borderWidth = 1;
rightStack.borderColor = new Color("#FF9500");
let rightText = rightStack.addText("Right Side");
rightText.font = Font.boldSystemFont(16);
rightText.textColor = new Color("#000000");

const eventsList = await getEventsList();
console.log(eventsList);
eventsList.forEach((item) => buildEventsStack(item, leftStack));
leftStack.addSpacer();

if (config.runsInWidget) {
  Script.setWidget(widget);
}
widget.presentMedium();
Script.complete();


async function getEventsList() {
    const eventsArray = await CalendarEvent.today();
    const incomingEventsArray = eventsArray
        .filter(
        (item) =>
            new Date(item.startDate).getTime() > new Date().getTime()
        )
        .sort((a, b) =>
            a.startDate > b.startDate ? 1 : a.startDate < b.startDate ? -1 : 0
        )
        .slice(0, 3);
    
    return incomingEventsArray;
}


function buildEventsStack(item, stack) {
    stack.addSpacer(7);
    const entryStack = stack.addStack();
    entryStack.layoutVertically();
    entryStack.borderWidth = 3;
    entryStack.borderColor = new Color(kWeekendColor);
    entryStack.cornerRadius = 5;
    entryStack.size = new Size(150, 0);
    entryStack.setPadding(4, 10, 4, 10);
  
    const entryTitle = entryStack.addText(item.title);
    entryTitle.font = Font.boldSystemFont(13);
    entryTitle.textColor = new Color(kWeekendColor);
    entryTitle.lineLimit = 1;
  
    dF.dateFormat = "HH:mm";
    const entryTime = entryStack.addText(
      dF.string(item.startDate) + " - " + dF.string(item.endDate)
    );
    entryTime.font = Font.semiboldSystemFont(11);
    entryTime.textColor = new Color(kWeekendColor);
    entryTime.textOpacity = 0.8;
  }
