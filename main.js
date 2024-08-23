// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: calendar-alt;

const kDayColor = "#c35b22";
const kMainBackgroundColor = "#1C1C1E";
const kRemindersBackgroundColor = "#EEEEEE";
const kCalendarBackgroundColor = "#2C2C2E";
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
leftStack.url = "calshow://";

let spacer = mainStack.addSpacer(5);

let rightStack = mainStack.addStack();
rightStack.layoutVertically();
rightStack.size = new Size(160, 0);
rightStack.borderWidth = 1;
rightStack.borderColor = new Color("#FF9500");

const eventsList = await getEventsList();
// console.log(eventsList);
eventsList.forEach((item) => buildEventsStack(item, leftStack));
leftStack.addSpacer();

await generateReminders(rightStack);

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
    const eventColor = item.calendar.color.hex;
    stack.addSpacer(7);
    const entryStack = stack.addStack();
    entryStack.layoutVertically();
    entryStack.borderWidth = 3;
    entryStack.borderColor = new Color(eventColor);
    entryStack.cornerRadius = 5;
    entryStack.size = new Size(150, 0);
    entryStack.setPadding(4, 10, 4, 10);
  
    const entryTitle = entryStack.addText(item.title);
    entryTitle.font = Font.boldSystemFont(13);
    entryTitle.textColor = new Color(eventColor);
    entryTitle.lineLimit = 1;
  
    dF.dateFormat = "HH:mm";
    const entryTime = entryStack.addText(
      dF.string(item.startDate)
    );
    entryTime.font = Font.semiboldSystemFont(11);
    entryTime.textColor = new Color(eventColor);
    entryTime.textOpacity = 0.8;
}

async function getTaskLists() {
    let allReminders = await Reminder.allIncomplete();
  
    let today = new Date();
    today.setHours(0, 0, 0, 0);
  
    let tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
  
    let dueReminders = allReminders.filter(reminder => {
      return reminder.dueDate && reminder.dueDate < tomorrow;
    });
  
    let upcomingReminders = allReminders.filter(reminder => {
      return reminder.dueDate && reminder.dueDate >= tomorrow;
    });
  
    return {
        dueReminders: dueReminders,
        upcomingReminders: upcomingReminders
    };
}



async function generateReminders(stack) {
    const taskLists = await getTaskLists();
    let dueCount = taskLists.dueReminders.length;
    let upcomingCount = taskLists.upcomingReminders.length;
    if (dueCount > 0) {
        let dueStack = stack.addStack();
        dueStack.layoutVertically();
        dueStack.backgroundColor = new Color(kRemindersBackgroundColor);
        dueStack.cornerRadius = 15;
        dueStack.size = new Size(160, 0);
        dueStack.setPadding(5, 10, 5, 10);
        dueStack.url = "x-apple-reminderkit://TODAY";
        generateRemindersTitle(dueStack, taskLists.dueReminders.length, "Due Today")
        taskLists.dueReminders
            .splice(0, 6)
            .forEach((task) => generateRemindersEntry(dueStack, task.title));
    }

    if (dueCount <= 5 && upcomingCount > 0) {
        let upcomingStack = stack.addStack();
        upcomingStack.layoutVertically();
        upcomingStack.setPadding(5, 10, 0, 10);
        upcomingStack.url = "x-apple-reminderkit://REMINDER/SCHEDULED";
        generateRemindersTitle(upcomingStack, taskLists.upcomingReminders.length, "Upcoming")
        taskLists.upcomingReminders
            .splice(0, 5 - dueCount)
            .forEach((task) => generateRemindersEntry(upcomingStack, task.title));
    }
}
  
function generateRemindersTitle(stack, taskCount, titleContent) {
    const titleStack = stack.addStack();
    titleStack.bottomAlignContent();
  
    const countStack = titleStack.addStack();
    const count = countStack.addText(taskCount + "");
    count.font = Font.heavySystemFont(17);
    count.textColor = new Color(kDayColor);
  
    titleStack.addSpacer(2);
  
    const nameStack = titleStack.addStack();
    nameStack.layoutVertically();
    const title = nameStack.addText(titleContent);
    title.font = Font.boldMonospacedSystemFont(12);
    title.textColor = new Color(kMainBackgroundColor);
    nameStack.addSpacer(3);
  
    titleStack.addSpacer();
}
  
function generateRemindersEntry(stack, reminder) {
    stack.addSpacer(4);
    const entryStack = stack.addStack();
    entryStack.layoutVertically();
    entryStack.setPadding(0, 0, 0, 5);
    const entryText = entryStack.addText(reminder);
    entryText.textColor = new Color(kCalendarBackgroundColor);
    entryText.font = Font.semiboldSystemFont(12);
    entryText.lineLimit = 1;
}