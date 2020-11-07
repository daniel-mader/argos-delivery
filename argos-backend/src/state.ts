import { Machine, interpret } from "xstate";

/* Argos state machine */
const stateMachine = Machine({
  id: "argos",
  initial: "NOT_STARTED",
  states: {
    NOT_STARTED: { on: { SCAN: "STARTED" } },
    STARTED: {
      on: {
        DAMAGED: "DAMAGED",
        SCAN: "COMPLETED",
        RESET: "NOT_STARTED",
      },
    },
    DAMAGED: { on: { SCAN: "COMPLETED", RESET: "NOT_STARTED" } },
    COMPLETED: { on: { RESET: "NOT_STARTED" } },
  },
});

export const argosStateService = interpret(stateMachine)
  .onTransition((state) =>
    console.log(`Delivery state switched to: ${state.value}`)
  )
  .start();
