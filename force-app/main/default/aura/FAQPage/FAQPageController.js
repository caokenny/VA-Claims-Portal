({
    toggleAnswer : function(component, event, helper) {
        let clickedQuestion = event.target;
        let answerElement = clickedQuestion.nextElementSibling;
        $A.util.toggleClass(answerElement, 'hide');
    }
})
