let widget = new ListWidget();
widget.backgroundColor = new Color("#ffffff");

let mainStack = widget.addStack();
mainStack.layoutHorizontally();

let leftStack = mainStack.addStack();
leftStack.layoutVertically();
leftStack.size = new Size(0, 0);
leftStack.borderWidth = 2;
leftStack.borderColor = new Color("#FF9500");
let leftText = leftStack.addText("Left Side");
leftText.font = Font.boldSystemFont(16);
leftText.textColor = new Color("#000000");

let spacer = mainStack.addSpacer(20);

let rightStack = mainStack.addStack();
rightStack.layoutVertically();
rightStack.size = new Size(0, 0);
rightStack.borderWidth = 2;
rightStack.borderColor = new Color("#FF9500");
let rightText = rightStack.addText("Right Side");
rightText.font = Font.boldSystemFont(16);
rightText.textColor = new Color("#000000");

if (config.runsInWidget) {
  Script.setWidget(widget);
}
widget.presentMedium();
Script.complete();
