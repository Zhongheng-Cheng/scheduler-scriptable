// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: calendar-alt;

const colorBackground = "#2e2e2e";
const colorReminderNumber = "#ee7800";
const colorReminderTitle = "#00a3af";
const colorReminderText = "#f8f4e6";
const colorReminderDueToday = "#393f4c";
const dF = new DateFormatter();
today = new Date();
today.setHours(0, 0, 0, 0);

let widget = new ListWidget();
widget.backgroundColor = new Color(colorBackground);

// Setting main layout
let mainStack = widget.addStack();
mainStack.layoutHorizontally();

let leftStack = mainStack.addStack();
leftStack.layoutVertically();
leftStack.size = new Size(162, 0);

let spacer = mainStack.addSpacer(4);

let rightStack = mainStack.addStack();
rightStack.layoutVertically();
rightStack.size = new Size(162, 150);
rightStack.url = "calshow://";

// Build stacks
await buildReminderStack(leftStack);
await buildCalendarStack(rightStack);
rightStack.addSpacer();
addRefreshTimeStack(rightStack);

// Build background image
let dateText = await getTodayDateText();
let image = buildBackgroundImage(dateText);
widget.backgroundImage = image;

// Run the widget
if (config.runsInWidget) {
  Script.setWidget(widget);
}
widget.presentMedium();
Script.complete();


async function getEvents() {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);
    const eventsArray = await CalendarEvent.between(startDate, endDate);

    let remainingRows = 6;
    let eventsDisplayArray = [];
    for (const event of eventsArray) {
        if (event.isAllDay) {
            remainingRows -= 1;
        } else {
            remainingRows -= 2;
        }

        if (remainingRows >= 0) {
            eventsDisplayArray.push(event);
        } else {
            break;
        }
    }

    return eventsDisplayArray;
}


function addEventEntry(item, stack) {
    const eventColor = item.calendar.color.hex;
    stack.addSpacer(1);
    let entryStack = stack.addStack();
    entryStack.layoutHorizontally();
    entryStack.centerAlignContent();

    let borderStack = entryStack.addStack();
    if (item.isAllDay) {
        borderStack.size = new Size(5, 18);
    } else {
        borderStack.size = new Size(5, 35);
    }
    borderStack.backgroundColor = new Color(eventColor);
    borderStack.cornerRadius = 3;
    
    let textStack = entryStack.addStack();
    textStack.layoutVertically();
    textStack.backgroundColor = new Color(eventColor, 0.05);
    textStack.cornerRadius = 8;
    textStack.size = new Size(150, 0);
    textStack.setPadding(3, 8, 3, 8);
  
    titleStack = textStack.addStack();
    let tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    let tomorrowEnd = new Date(today);
    tomorrowEnd.setDate(today.getDate() + 2);
    if (item.startDate < tomorrow) {
        addEntry(titleStack, item.title, eventColor);
    } else if (item.startDate < tomorrowEnd) {
        const timeText = "Tmr"
        addEntry(titleStack, item.title, eventColor, timeText, eventColor);
    } else {
        dF.dateFormat = "MM/dd";
        const timeText = dF.string(item.startDate);
        addEntry(titleStack, item.title, eventColor, timeText, eventColor);
    }
    
  
    if (!item.isAllDay) {
        dF.dateFormat = "HH:mm";
        let additionalText = dF.string(item.startDate);
        if (item.location) {
            additionalText += ' ' + item.location;
        }
        const eventTime = textStack.addText(additionalText);
        eventTime.font = Font.semiboldSystemFont(11);
        eventTime.textColor = new Color(eventColor);
        eventTime.textOpacity = 0.8;
        eventTime.lineLimit = 1;
    }
    
}

async function getTasks() {
    const allRemindersArray = await Reminder.allIncomplete()
    const allReminders = allRemindersArray
        .sort((a, b) =>
        a.dueDate > b.dueDate ? 1 : a.dueDate < b.dueDate ? -1 : 0
    );
  
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


async function buildCalendarStack(stack) {
    const eventsList = await getEvents();
    eventsList.forEach((item) => addEventEntry(item, stack));
}


async function buildReminderStack(stack) {
    const taskLists = await getTasks();
    let dueCount = taskLists.dueReminders.length;
    let upcomingCount = taskLists.upcomingReminders.length;
    if (dueCount > 0) {
        let dueStack = stack.addStack();
        dueStack.layoutVertically();
        dueStack.backgroundColor = new Color(colorReminderDueToday);
        dueStack.cornerRadius = 15;
        dueStack.size = new Size(160, 0);
        dueStack.setPadding(5, 8, 5, 5);
        dueStack.url = "x-apple-reminderkit://TODAY";
        const dueTitleStack = dueStack.addStack();
        addReminderTitle(dueTitleStack, taskLists.dueReminders.length, "Due Today")
        taskLists.dueReminders
            .splice(0, 6)
            .forEach((task) => addTaskEntry(dueStack, task, false));
    }

    if (dueCount <= 5 && upcomingCount > 0) {
        let upcomingStack = stack.addStack();
        upcomingStack.setPadding(2, 8, 0, 5);
        upcomingStack.url = "x-apple-reminderkit://REMINDER/SCHEDULED";
        const upcomingTitleStack = upcomingStack.addStack();
        addReminderTitle(upcomingTitleStack, taskLists.upcomingReminders.length, "Upcoming")
        taskLists.upcomingReminders
            .splice(0, 5 - dueCount)
            .forEach((task) => addTaskEntry(upcomingStack, task, true));
    }
}
  
function addReminderTitle(stack, taskCount, titleContent) {
    stack.layoutHorizontally();
    stack.centerAlignContent();
  
    const countStack = stack.addStack();
    const count = countStack.addText(taskCount + "");
    count.font = Font.heavySystemFont(13);
    count.textColor = new Color(colorReminderNumber);
  
    stack.addSpacer(5);
  
    const nameStack = stack.addStack();
    nameStack.layoutVertically();
    const title = nameStack.addText(titleContent);
    title.font = Font.boldMonospacedSystemFont(11);
    title.textColor = new Color(colorReminderTitle);
}
  
function addTaskEntry(stack, task, showDate) {
    stack.layoutVertically();
    stack.addSpacer(4);
    const entryStack = stack.addStack();

    let tomorrowEnd = new Date(today);
    tomorrowEnd.setDate(today.getDate() + 2);

    if (!showDate) {
        if (task.dueDateIncludesTime) {
            dF.dateFormat = "HH:mm";
            let timeText = dF.string(task.dueDate);
            addEntry(entryStack, task.title, colorReminderText, timeText, colorReminderText);
        } else {
            addEntry(entryStack, task.title, colorReminderText);
        }
    } else {
        if (task.dueDate < tomorrowEnd) {
            const timeText = "Tmr";
            addEntry(entryStack, task.title, colorReminderText, timeText, colorReminderText);
        } else {
            dF.dateFormat = "MM/dd";
            const timeText = dF.string(task.dueDate);
            addEntry(entryStack, task.title, colorReminderText, timeText, colorReminderText);
        }
    }
}

function addEntry(stack, title, titleColor, date, dateColor) {
    stack.layoutHorizontally();
    stack.bottomAlignContent();
    const textStack = stack.addStack();
    const titleText = textStack.addText(title);
    titleText.textColor = new Color(titleColor);
    titleText.font = Font.semiboldSystemFont(13);
    titleText.lineLimit = 1;

    stack.addSpacer();

    if (date) {
        const timeStack = stack.addStack();
        const taskTime = timeStack.addText(date);
        taskTime.font = Font.semiboldSystemFont(10);
        taskTime.textColor = new Color(dateColor);
    }
}

function addRefreshTimeStack(stack) {
    let refreshAfterDate = new Date();
    refreshAfterDate.setSeconds(refreshAfterDate.getSeconds() + 5);
    widget.refreshAfterDate = refreshAfterDate;
    dF.dateFormat = "HH:mm E";
    // let refreshTimeText = dF.string(refreshTime);
    const refreshTimeStack = stack.addStack();
    refreshTimeStack.layoutHorizontally();
    refreshTimeStack.addSpacer();
    const refreshTimeText = refreshTimeStack.addText("Last refresh: " + dF.string(refreshAfterDate));
    refreshTimeText.textColor = new Color(colorReminderText);
    refreshTimeText.font = Font.semiboldSystemFont(8);
    refreshTimeText.lineLimit = 1;
}

async function getTodayDateText() {
    let today = new Date();
    dF.dateFormat = "MMM d";
    return dF.string(today);
}

function buildBackgroundImage(text) {
    let drawContext = new DrawContext();
    drawContext.size = new Size(100, 100);
    drawContext.opaque = false;
    drawContext.respectScreenScale = true;

    // Create semi-transparent text
    let alpha = 0.2;
    drawContext.setFont(new Font("Helvetica-BoldOblique", 23));
    drawContext.setTextColor(new Color("#FFFFFF", alpha));
    drawContext.drawTextInRect(text, new Rect(-2, 50, drawContext.size.width, 50));

    // Return image format
    let image = drawContext.getImage();
    return image;
}