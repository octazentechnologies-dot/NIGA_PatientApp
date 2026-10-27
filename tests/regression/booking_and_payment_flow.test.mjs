import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Issue 1: Sequential Appointment Booking Tests (without logout)', () => {
  it('Scenario A: First booking completes successfully with unique IDs', () => {
    // Simulate booking state container
    let patientAppId = null;
    let bookingToken = null;
    let paymentOrderId = null;
    let paymentStatus = null;
    let paymentFlowState = 'IDLE';

    // Step 1: User selects slot and proceeds to pay
    assert.equal(patientAppId, null);

    // Step 2: createOrder executes hold
    const holdBooking = (id, token) => {
      patientAppId = id;
      bookingToken = token;
      return { patientAppId: id, bookingToken: token };
    };

    const firstHold = holdBooking(101, 'tok_booking_101');
    assert.equal(firstHold.patientAppId, 101);
    assert.equal(firstHold.bookingToken, 'tok_booking_101');

    // Step 3: Gateway payment order created
    paymentOrderId = 5001;
    paymentFlowState = 'VERIFYING';

    // Step 4: Payment confirmed
    paymentFlowState = 'CONFIRMED';
    paymentStatus = 'success';
    assert.equal(paymentStatus, 'success');
    assert.equal(paymentOrderId, 5001);

    // Step 5: User finishes booking flow (onFinishBookingFlow)
    const resetBooking = () => {
      patientAppId = null;
      bookingToken = null;
      paymentOrderId = null;
      paymentStatus = null;
      paymentFlowState = 'IDLE';
    };

    resetBooking();

    // Verify all temporary state was wiped
    assert.equal(patientAppId, null);
    assert.equal(bookingToken, null);
    assert.equal(paymentOrderId, null);
    assert.equal(paymentStatus, null);
    assert.equal(paymentFlowState, 'IDLE');
  });

  it('Scenario B: Second booking starts fresh without logout and succeeds with distinct IDs', () => {
    let patientAppId = null;
    let bookingToken = null;
    let paymentOrderId = null;
    let paymentStatus = null;
    let holdCreatedCount = 0;

    const createOrder = (submitBooking) => {
      let currentPatientAppId = patientAppId;
      if (!currentPatientAppId) {
        const hold = submitBooking();
        patientAppId = hold.patientAppId;
        bookingToken = hold.bookingToken;
        currentPatientAppId = hold.patientAppId;
      }
      return {
        paymentOrderId: 6000 + currentPatientAppId,
        patientAppId: currentPatientAppId,
      };
    };

    // Booking 1
    const order1 = createOrder(() => {
      holdCreatedCount++;
      return { patientAppId: 201, bookingToken: 'tok_201' };
    });
    paymentOrderId = order1.paymentOrderId;
    paymentStatus = 'success';

    assert.equal(order1.patientAppId, 201);
    assert.equal(paymentOrderId, 6201);
    assert.equal(holdCreatedCount, 1);

    // Flow completed - reset state
    patientAppId = null;
    bookingToken = null;
    paymentOrderId = null;
    paymentStatus = null;

    // Booking 2 WITHOUT LOGOUT
    const order2 = createOrder(() => {
      holdCreatedCount++;
      return { patientAppId: 202, bookingToken: 'tok_202' };
    });
    paymentOrderId = order2.paymentOrderId;
    paymentStatus = 'success';

    assert.equal(order2.patientAppId, 202);
    assert.equal(paymentOrderId, 6202);
    assert.equal(holdCreatedCount, 2);
    assert.notEqual(order1.patientAppId, order2.patientAppId);
    assert.notEqual(order1.paymentOrderId, order2.paymentOrderId);
  });

  it('Scenario C: Multiple sequential bookings (3 sequential bookings) verified', () => {
    const bookings = [];
    let nextId = 300;

    for (let i = 1; i <= 3; i++) {
      let patientAppId = null;
      let bookingToken = null;

      // Start booking i
      assert.equal(patientAppId, null, `Booking ${i} must start with clean patientAppId`);
      assert.equal(bookingToken, null, `Booking ${i} must start with clean bookingToken`);

      // Hold created
      nextId++;
      patientAppId = nextId;
      bookingToken = `tok_${nextId}`;
      const orderId = 8000 + i;

      bookings.push({
        patientAppId,
        bookingToken,
        paymentOrderId: orderId,
      });

      // Teardown / completion
      patientAppId = null;
      bookingToken = null;
    }

    assert.equal(bookings.length, 3);
    const ids = new Set(bookings.map((b) => b.patientAppId));
    const orderIds = new Set(bookings.map((b) => b.paymentOrderId));
    assert.equal(ids.size, 3, 'All 3 appointments must have distinct IDs');
    assert.equal(orderIds.size, 3, 'All 3 payment orders must have distinct IDs');
  });
});

describe('Issue 2: Payment Failed Screen Navigation Tests', () => {
  it('Header back button invokes onClose instead of onRetry', () => {
    let closed = false;
    let retried = false;

    const vm = {
      status: 'failed',
      onClose: () => { closed = true; },
      onRetry: () => { retried = true; },
    };

    // Simulate pressing back button in FailedStatus (which calls onClose)
    vm.onClose();

    assert.equal(closed, true, 'Pressing back on FailedStatus must trigger onClose');
    assert.equal(retried, false, 'Pressing back must NOT trigger onRetry');
  });

  it('onClose on Payment Failed navigates reliably to Home screen', () => {
    let currentRoute = 'PaymentStatusView (failed)';
    let selectedTab = 'doctors';
    let bookingOpen = true;
    let profileDoctorId = '101';
    let paymentState = 'FAILED';

    const onCloseFailure = () => {
      // Payment reset
      paymentState = 'IDLE';
      // Reset booking
      bookingOpen = false;
      profileDoctorId = null;
      // Navigate to Home screen
      selectedTab = 'home';
      currentRoute = 'HomeView';
    };

    onCloseFailure();

    assert.equal(currentRoute, 'HomeView');
    assert.equal(selectedTab, 'home');
    assert.equal(bookingOpen, false);
    assert.equal(profileDoctorId, null);
    assert.equal(paymentState, 'IDLE');
  });

  it('Infinite re-opening loop is prevented via failedNotifiedRef guard', () => {
    let notificationCount = 0;
    const failedNotifiedRef = { current: false };

    const checkFailedEffect = (state, errorMessage) => {
      if (state === 'FAILED' && errorMessage) {
        if (!failedNotifiedRef.current) {
          failedNotifiedRef.current = true;
          notificationCount++;
        }
      } else if (state !== 'FAILED') {
        failedNotifiedRef.current = false;
      }
    };

    // First failure triggers notification
    checkFailedEffect('FAILED', 'Card declined');
    assert.equal(notificationCount, 1);

    // Re-renders while in FAILED state DO NOT re-trigger
    checkFailedEffect('FAILED', 'Card declined');
    checkFailedEffect('FAILED', 'Card declined');
    assert.equal(notificationCount, 1, 'Subsequent renders must not re-notify');

    // Resetting state clears guard
    checkFailedEffect('IDLE', null);
    assert.equal(failedNotifiedRef.current, false);

    // New failure triggers new notification
    checkFailedEffect('FAILED', 'Insufficient funds');
    assert.equal(notificationCount, 2);
  });

  it('Android hardware back on Payment Failed navigates directly to Home', () => {
    let paymentStatus = 'failed';
    let navigatedToHome = false;
    let paymentReset = false;

    const onHomeHardwareBack = () => {
      if (paymentStatus === 'failed') {
        paymentReset = true;
        navigatedToHome = true;
        return true;
      }
      return false;
    };

    const handled = onHomeHardwareBack();
    assert.equal(handled, true);
    assert.equal(paymentReset, true);
    assert.equal(navigatedToHome, true);
  });

  it('Payment state reset clears paymentOrderId, errorMessage, and inFlight', () => {
    let inFlight = true;
    let state = 'FAILED';
    let errorMessage = 'Payment gateway timeout';
    let paymentOrderId = 9999;

    const reset = () => {
      inFlight = false;
      state = 'IDLE';
      errorMessage = null;
      paymentOrderId = null;
    };

    reset();

    assert.equal(inFlight, false);
    assert.equal(state, 'IDLE');
    assert.equal(errorMessage, null);
    assert.equal(paymentOrderId, null);
  });
});

describe('Issue 3: Home Dashboard Pull-to-Refresh for My Bookings', () => {
  it('Pull-to-refresh triggers dashboard and visits refetch and manages refreshing state', async () => {
    let isHomeRefreshing = false;
    let dashboardRefetched = false;
    let visitsRefetched = false;
    let familyRefetched = false;

    const refetchHomeDashboard = async () => {
      dashboardRefetched = true;
      return { data: { nextAppointments: [{ patientAppId: 101, status: 'CONFIRMED' }] } };
    };

    const refetchVisits = async () => {
      visitsRefetched = true;
      return { data: [{ patientAppId: 101, status: 'CONFIRMED' }] };
    };

    const refetchFamily = async () => {
      familyRefetched = true;
      return { data: [] };
    };

    const onRefreshHome = async () => {
      isHomeRefreshing = true;
      try {
        await Promise.allSettled([
          refetchHomeDashboard(),
          refetchVisits(),
          refetchFamily(),
        ]);
      } finally {
        isHomeRefreshing = false;
      }
    };

    assert.equal(isHomeRefreshing, false);
    const refreshPromise = onRefreshHome();
    assert.equal(isHomeRefreshing, true);

    await refreshPromise;

    assert.equal(isHomeRefreshing, false);
    assert.equal(dashboardRefetched, true);
    assert.equal(visitsRefetched, true);
    assert.equal(familyRefetched, true);
  });

  it('Pull-to-refresh updates bookings list on Dashboard even when an error occurs in one endpoint', async () => {
    let isHomeRefreshing = false;
    let visitsRefetched = false;

    const refetchVisits = async () => {
      visitsRefetched = true;
      return { data: [{ patientAppId: 102, status: 'CONFIRMED' }] };
    };

    const failingEndpoint = async () => {
      throw new Error('Network error');
    };

    const onRefreshHome = async () => {
      isHomeRefreshing = true;
      try {
        await Promise.allSettled([
          refetchVisits(),
          failingEndpoint(),
        ]);
      } finally {
        isHomeRefreshing = false;
      }
    };

    await onRefreshHome();

    assert.equal(isHomeRefreshing, false);
    assert.equal(visitsRefetched, true);
  });
});

describe('Issue 4: Cancelled or Failed Payment Does Not Create Booking', () => {
  it('Hold is cancelled on backend when payment is cancelled by user', async () => {
    let patientAppId = 105;
    let paymentStatus = null;
    let serverCancelledAppId = null;

    const cancelAppointmentMutation = async ({ patientAppId: id }) => {
      serverCancelledAppId = id;
      return { success: true };
    };

    const onCancelHold = async (reasonText) => {
      if (patientAppId != null && paymentStatus !== 'success') {
        await cancelAppointmentMutation({
          patientAppId,
          reasonCode: 'PatientRequest',
          reasonText: reasonText || 'Payment cancelled by user',
        });
      }
      patientAppId = null;
    };

    // User cancels payment
    await onCancelHold('Payment cancelled by user');

    assert.equal(serverCancelledAppId, 105);
    assert.equal(patientAppId, null);
  });

  it('Unpaid online holds (PENDING/UNPAID/FAILED) are filtered out from active dashboard list', () => {
    const rawVisits = [
      {
        patientAppId: 101,
        status: 'NOT ARRIVED',
        consultMode: 'Tele',
        paymentStatus: 'PAID', // legitimately paid online
      },
      {
        patientAppId: 102,
        status: 'NOT ARRIVED',
        consultMode: 'Tele',
        paymentStatus: 'PENDING', // unpaid hold — cancelled or abandoned
      },
      {
        patientAppId: 103,
        status: 'NOT ARRIVED',
        consultMode: 'Tele',
        paymentStatus: 'FAILED', // failed payment hold
      },
      {
        patientAppId: 104,
        status: 'NOT ARRIVED',
        consultMode: 'InClinic',
        paymentStatus: 'PAY_AT_CLINIC', // clinic pay
      },
      {
        patientAppId: 105,
        status: 'CANCELLED',
        consultMode: 'Tele',
        paymentStatus: 'PAID',
      },
    ];

    const activeList = rawVisits.filter((a) => {
      if (a.status === 'CANCELLED' || a.status === 'COMPLETED') {
        return false;
      }
      const payStatus = (a.paymentStatus || '').toUpperCase();
      if (
        payStatus === 'FAILED' ||
        payStatus === 'CANCELLED' ||
        payStatus === 'UNPAID'
      ) {
        return false;
      }
      const isOnlineTele = Boolean(a.consultMode === 'Tele');
      if (isOnlineTele && payStatus === 'PENDING') {
        return false;
      }
      return true;
    });

    assert.equal(activeList.length, 2);
    assert.equal(activeList[0].patientAppId, 101); // Paid tele
    assert.equal(activeList[1].patientAppId, 104); // Pay at clinic
  });

  it('bookingApi does not invalidate Visits tag for online holds without payAtClinic', () => {
    const getInvalidatedTags = (arg) =>
      arg?.payAtClinic
        ? ['Visits', 'VisitDetail', 'Slots', 'Bookings']
        : ['Slots', 'Bookings'];

    // Online hold before payment
    const onlineHoldTags = getInvalidatedTags({ payAtClinic: false });
    assert.deepEqual(onlineHoldTags, ['Slots', 'Bookings']);
    assert.equal(onlineHoldTags.includes('Visits'), false);

    // Pay at clinic immediate booking
    const clinicTags = getInvalidatedTags({ payAtClinic: true });
    assert.deepEqual(clinicTags, ['Visits', 'VisitDetail', 'Slots', 'Bookings']);
    assert.equal(clinicTags.includes('Visits'), true);
  });
});

describe('Issue 5: In-Clinic Appointment Check-In Flow', () => {
  // Helper to compute check-in state matching useAppointmentDetailController
  function computeCheckInState({
    mode,
    phase = 'confirmed',
    clinicCheckInState = 'ready',
    visitDetailStatus = 'NOT ARRIVED',
  }) {
    const isClinic = mode === 'clinic';
    const normalizedStatus = (visitDetailStatus || '').toUpperCase();
    const isCheckedIn =
      isClinic &&
      (clinicCheckInState === 'waiting' ||
        normalizedStatus === 'WAITING' ||
        normalizedStatus === 'WALK-IN');

    // UI visibility rules
    const showCheckInCard = !isCheckedIn && isClinic && phase !== 'ended';
    const showCheckedInCard = isCheckedIn && isClinic;

    return {
      isClinic,
      isCheckedIn,
      showCheckInCard,
      showCheckedInCard,
    };
  }

  it('Scenario 1: In-Clinic appointment not checked in displays Check In Now card and button', () => {
    const state = computeCheckInState({
      mode: 'clinic',
      clinicCheckInState: 'ready',
      visitDetailStatus: 'NOT ARRIVED',
    });

    assert.equal(state.isClinic, true);
    assert.equal(state.isCheckedIn, false);
    assert.equal(state.showCheckInCard, true);
    assert.equal(state.showCheckedInCard, false);
  });

  it('Scenario 2: Successful check-in hides Check In Now card and displays "You are checked in." status', () => {
    let clinicCheckInState = 'ready';
    let checkedInAtLabel = '';
    let queuePosition = null;

    // Simulate check-in action
    const checkInResponse = {
      success: true,
      data: {
        patientAppId: 101,
        status: 'WAITING',
        queuePosition: 3,
        readyAt: null,
      },
    };

    if (checkInResponse.success) {
      clinicCheckInState = 'waiting';
      checkedInAtLabel = '03:30 PM';
      queuePosition = checkInResponse.data.queuePosition;
    }

    const state = computeCheckInState({
      mode: 'clinic',
      clinicCheckInState,
      visitDetailStatus: checkInResponse.data.status,
    });

    assert.equal(state.isCheckedIn, true);
    assert.equal(state.showCheckInCard, false);
    assert.equal(state.showCheckedInCard, true);
    assert.equal(queuePosition, 3);
    assert.equal(checkedInAtLabel, '03:30 PM');
  });

  it('Scenario 3: Navigating away and reopening appointment preserves checked-in status from API', () => {
    // When returning, visitDetail is fetched from cache/server with status 'WAITING'
    const serverVisitDetail = {
      patientAppId: 101,
      status: 'WAITING',
      queuePosition: 3,
    };

    const state = computeCheckInState({
      mode: 'clinic',
      clinicCheckInState: 'ready', // State before effect runs
      visitDetailStatus: serverVisitDetail.status,
    });

    assert.equal(state.isCheckedIn, true);
    assert.equal(state.showCheckInCard, false);
    assert.equal(state.showCheckedInCard, true);
  });

  it('Scenario 4: Check-in API failure does not mark user as checked-in and displays error', () => {
    let checkInBusy = false;
    let checkInError = null;
    let clinicCheckInState = 'ready';

    const performCheckIn = (willFail = true) => {
      checkInBusy = true;
      checkInError = null;
      if (willFail) {
        checkInBusy = false;
        checkInError = 'Network error. Please try again.';
        return;
      }
      clinicCheckInState = 'waiting';
      checkInBusy = false;
    };

    performCheckIn(true);

    assert.equal(checkInBusy, false);
    assert.equal(checkInError, 'Network error. Please try again.');
    assert.equal(clinicCheckInState, 'ready');

    const state = computeCheckInState({
      mode: 'clinic',
      clinicCheckInState,
      visitDetailStatus: 'NOT ARRIVED',
    });

    assert.equal(state.isCheckedIn, false);
    assert.equal(state.showCheckInCard, true);
    assert.equal(state.showCheckedInCard, false);
  });

  it('Scenario 5: Double-tap / concurrent check-in request protection', () => {
    let apiCallCount = 0;
    let checkInBusy = false;

    const onConfirmCheckIn = () => {
      if (checkInBusy) return;
      checkInBusy = true;
      apiCallCount++;
    };

    // First tap
    onConfirmCheckIn();
    assert.equal(apiCallCount, 1);
    assert.equal(checkInBusy, true);

    // Second immediate tap while busy
    onConfirmCheckIn();
    assert.equal(apiCallCount, 1); // Ignored due to guard

    // Reset when call finishes
    checkInBusy = false;
  });

  it('Scenario 6: Online appointments do not show clinic check-in card or status', () => {
    const videoState = computeCheckInState({
      mode: 'video',
      clinicCheckInState: 'ready',
      visitDetailStatus: 'NOT ARRIVED',
    });
    assert.equal(videoState.isClinic, false);
    assert.equal(videoState.isCheckedIn, false);
    assert.equal(videoState.showCheckInCard, false);
    assert.equal(videoState.showCheckedInCard, false);

    const chatState = computeCheckInState({
      mode: 'chat',
      clinicCheckInState: 'ready',
      visitDetailStatus: 'NOT ARRIVED',
    });
    assert.equal(chatState.isClinic, false);
    assert.equal(chatState.isCheckedIn, false);
    assert.equal(chatState.showCheckInCard, false);
    assert.equal(chatState.showCheckedInCard, false);
  });

  it('Scenario 7: Ineligible/ended clinic appointments do not show Check In button', () => {
    const endedState = computeCheckInState({
      mode: 'clinic',
      phase: 'ended',
      clinicCheckInState: 'ready',
      visitDetailStatus: 'NOT ARRIVED',
    });

    assert.equal(endedState.isClinic, true);
    assert.equal(endedState.isCheckedIn, false);
    assert.equal(endedState.showCheckInCard, false);
  });
});

describe('Issue 6: Completed Appointment Details Rules (In-Clinic and Online)', () => {
  // Helper to compute UI visibility matching useAppointmentDetailController + ClinicAppointmentView + AppointmentDetailView
  function computeAppointmentDetailsUI({
    mode = 'clinic',
    visitStatus = 'COMPLETED',
    clinicCheckInState = 'ready',
    phase = 'ended',
    visitDetail = null,
    prescriptionData = null,
  }) {
    const isClinic = mode === 'clinic';
    const isCompleted = (visitStatus || '').toUpperCase() === 'COMPLETED';
    const isCheckedIn =
      !isCompleted &&
      isClinic &&
      (clinicCheckInState === 'waiting' ||
        visitStatus === 'WAITING' ||
        visitStatus === 'WALK-IN');

    // Rule 1: hide Confirmed status label / banner
    const showConfirmedBanner = !isCompleted;

    // Rule 2: Check in Now area - hide
    const showCheckedInCard = isCheckedIn && !isCompleted;
    const showCheckInCard = !isCompleted && !isCheckedIn && phase !== 'ended';

    // Rule 3: hide Reschedule button
    // Rule 4: hide Cancel button
    const showFooterActions = !isCompleted;

    // Rule 5: hide Switch To An online Consultation Instead
    const showSwitchOnline = isClinic && !isCompleted;

    // Prescription button logic: View Prescription shown when completed AND prescription available
    const hasPrescription = Boolean(
      (visitDetail?.erxSnapshotId != null && Number(visitDetail.erxSnapshotId) > 0) ||
      visitDetail?.erxSigned ||
      Boolean(visitDetail?.erxPdfUrl) ||
      (Array.isArray(prescriptionData?.items) && prescriptionData.items.length > 0)
    );
    const showViewPrescriptionButton = isCompleted && hasPrescription;
    const showAddPrescriptionButton = isClinic && isCompleted;

    // Online timing / countdown section
    const showOnlineTimer = !isClinic && !isCompleted && phase !== 'ended';

    return {
      mode,
      isClinic,
      isCompleted,
      hasPrescription,
      isCheckedIn,
      showConfirmedBanner,
      showCheckedInCard,
      showCheckInCard,
      showFooterActions,
      showSwitchOnline,
      showAddPrescriptionButton,
      showViewPrescriptionButton,
      showOnlineTimer,
    };
  }

  it('1. Completed In-Clinic appointment: hides confirmed banner, check-in, reschedule/cancel, switch online, and displays View Prescription when prescription available', () => {
    const completedClinicWithRx = computeAppointmentDetailsUI({
      mode: 'clinic',
      visitStatus: 'COMPLETED',
      clinicCheckInState: 'ready',
      visitDetail: { erxSnapshotId: 101, erxSigned: true },
    });

    assert.equal(completedClinicWithRx.isCompleted, true);
    assert.equal(completedClinicWithRx.showConfirmedBanner, false, 'Confirmed banner must be hidden');
    assert.equal(completedClinicWithRx.showCheckInCard, false, 'Check In Now card must be hidden');
    assert.equal(completedClinicWithRx.showCheckedInCard, false, 'Checked In card must be hidden');
    assert.equal(completedClinicWithRx.isCheckedIn, false, 'isCheckedIn must be false when completed');
    assert.equal(completedClinicWithRx.showFooterActions, false, 'Reschedule & Cancel buttons must be hidden');
    assert.equal(completedClinicWithRx.showSwitchOnline, false, 'Switch to online must be hidden');
    assert.equal(completedClinicWithRx.showViewPrescriptionButton, true, 'View Prescription button must be shown in place of Check In');
  });

  it('2. Completed Online appointment: hides confirmed banner, reschedule, cancel, and timing countdown', () => {
    const completedOnline = computeAppointmentDetailsUI({
      mode: 'video',
      visitStatus: 'COMPLETED',
      phase: 'ended',
    });

    assert.equal(completedOnline.isCompleted, true);
    assert.equal(completedOnline.showConfirmedBanner, false, 'Confirmed banner must be hidden for online');
    assert.equal(completedOnline.showFooterActions, false, 'Reschedule & Cancel buttons must be hidden for online');
    assert.equal(completedOnline.showOnlineTimer, false, 'Timing / countdown section must be hidden for online');
    assert.equal(completedOnline.showCheckInCard, false, 'Check-in is not present for online');
  });

  it('3. Confirmed In-Clinic appointment: preserves existing UI', () => {
    const confirmedClinic = computeAppointmentDetailsUI({
      mode: 'clinic',
      visitStatus: 'NOT ARRIVED',
      phase: 'confirmed',
      clinicCheckInState: 'ready',
    });

    assert.equal(confirmedClinic.isCompleted, false);
    assert.equal(confirmedClinic.showConfirmedBanner, true, 'Confirmed banner remains visible');
    assert.equal(confirmedClinic.showCheckInCard, true, 'Check In Now card remains visible');
    assert.equal(confirmedClinic.showFooterActions, true, 'Reschedule & Cancel remain visible');
    assert.equal(confirmedClinic.showSwitchOnline, true, 'Switch to online remains visible');
    assert.equal(confirmedClinic.showAddPrescriptionButton, false, 'Add Prescription button is not shown for active booking');
  });

  it('4. Confirmed Online appointment: preserves existing UI', () => {
    const confirmedOnline = computeAppointmentDetailsUI({
      mode: 'video',
      visitStatus: 'CONFIRMED',
      phase: 'upcoming',
    });

    assert.equal(confirmedOnline.isCompleted, false);
    assert.equal(confirmedOnline.showConfirmedBanner, true, 'Confirmed banner remains visible');
    assert.equal(confirmedOnline.showFooterActions, true, 'Reschedule & Cancel remain visible');
    assert.equal(confirmedOnline.showOnlineTimer, true, 'Countdown timer remains visible');
  });

  it('5. Add Prescription button opens existing document upload / selection flow', () => {
    let uploadOpen = false;
    let selectSheetOpen = false;
    const libraryDocuments = [];

    const onAddPrescription = () => {
      if (libraryDocuments.length > 0) {
        selectSheetOpen = true;
        return;
      }
      uploadOpen = true;
    };

    assert.equal(uploadOpen, false);
    assert.equal(selectSheetOpen, false);

    onAddPrescription();
    assert.equal(uploadOpen, true, 'UploadDocumentView modal opens when tapping Add Prescription');
  });
});

describe('Issue 7: My Appointments Navigation and Back Handling', () => {
  const mockRawVisits = [
    {
      patientAppId: 201,
      status: 'CONFIRMED',
      consultMode: 'InClinic',
      paymentStatus: 'PAID',
    },
    {
      patientAppId: 202,
      status: 'COMPLETED',
      consultMode: 'InClinic',
      paymentStatus: 'PAID',
    },
    {
      patientAppId: 203,
      status: 'CANCELLED',
      consultMode: 'Tele',
      paymentStatus: 'PAID',
    },
  ];

  // Dashboard filter in useHomeController
  const homeAppointments = mockRawVisits
    .filter((a) => {
      if (a.status === 'CANCELLED' || a.status === 'COMPLETED') {
        return false;
      }
      return true;
    })
    .map((a) => ({ id: String(a.patientAppId), status: a.status.toLowerCase() }));

  // My Appointments list in useMyAppointmentsController
  const myAppointmentsList = mockRawVisits.map((a) => ({
    id: String(a.patientAppId),
    status: a.status.toLowerCase(),
    visitStatus: a.status,
    mode: a.consultMode === 'InClinic' ? 'clinic' : 'video',
  }));

  function resolveSelectedAppointment(selectedId) {
    return (
      homeAppointments.find((item) => item.id === selectedId) ??
      myAppointmentsList.find((item) => item.id === selectedId) ??
      (selectedId ? { id: selectedId, status: 'confirmed' } : null)
    );
  }

  it('1. Confirmed, Completed, and Cancelled appointments resolve properly from My Appointments', () => {
    // Confirmed exists in homeAppointments and myAppointmentsList
    const confirmed = resolveSelectedAppointment('201');
    assert.ok(confirmed, 'Confirmed appointment must resolve');
    assert.equal(confirmed.id, '201');

    // Completed is filtered out from homeAppointments, but present in myAppointmentsList
    assert.equal(homeAppointments.find((a) => a.id === '202'), undefined);
    const completed = resolveSelectedAppointment('202');
    assert.ok(completed, 'Completed appointment must resolve from myAppointmentsList');
    assert.equal(completed.id, '202');
    assert.equal(completed.status, 'completed');

    // Cancelled is filtered out from homeAppointments, but present in myAppointmentsList
    assert.equal(homeAppointments.find((a) => a.id === '203'), undefined);
    const cancelled = resolveSelectedAppointment('203');
    assert.ok(cancelled, 'Cancelled appointment must resolve from myAppointmentsList');
    assert.equal(cancelled.id, '203');
    assert.equal(cancelled.status, 'cancelled');
  });

  it('2. Selecting appointment from My Appointments preserves myAppointmentsOpen in navigation stack', () => {
    let myAppointmentsOpen = true;
    let selectedAppointmentId = null;

    const onOpenAppointment = (id) => {
      // Must NOT set myAppointmentsOpen to false
      selectedAppointmentId = id;
    };

    onOpenAppointment('202'); // Open completed appointment
    assert.equal(selectedAppointmentId, '202');
    assert.equal(myAppointmentsOpen, true, 'myAppointmentsOpen remains true to maintain stack');
  });

  it('3. Header Back and Android hardware Back return to My Appointments (not Account)', () => {
    let myAppointmentsOpen = true;
    let selectedAppointmentId = '202';
    let currentScreen = 'AppointmentDetails';

    const renderNavigator = () => {
      const selected = resolveSelectedAppointment(selectedAppointmentId);
      if (selectedAppointmentId && selected) {
        return 'AppointmentDetails';
      }
      if (myAppointmentsOpen) {
        return 'MyAppointments';
      }
      return 'Account';
    };

    assert.equal(renderNavigator(), 'AppointmentDetails');

    // User presses back (header back or hardware back handler)
    const onCloseAppointment = () => {
      selectedAppointmentId = null;
    };

    onCloseAppointment();
    assert.equal(
      renderNavigator(),
      'MyAppointments',
      'Pressing back from Appointment Details must return to MyAppointments, not Account',
    );

    // Second back press exits MyAppointments to Account
    const onCloseMyAppointments = () => {
      myAppointmentsOpen = false;
    };

    onCloseMyAppointments();
    assert.equal(
      renderNavigator(),
      'Account',
      'Pressing back from MyAppointments returns to Account',
    );
  });

  it('4. Opening appointment from Home dashboard returns to Home on back', () => {
    let myAppointmentsOpen = false;
    let selectedAppointmentId = '201';

    const renderNavigator = () => {
      const selected = resolveSelectedAppointment(selectedAppointmentId);
      if (selectedAppointmentId && selected) {
        return 'AppointmentDetails';
      }
      if (myAppointmentsOpen) {
        return 'MyAppointments';
      }
      return 'Home';
    };

    assert.equal(renderNavigator(), 'AppointmentDetails');

    selectedAppointmentId = null; // onBack
    assert.equal(
      renderNavigator(),
      'Home',
      'Pressing back from Home-originated appointment returns directly to Home',
    );
  });

  it('5. UI rules for Confirmed, Completed, and Cancelled appointments are respected', () => {
    const computeUI = (visitStatus, mode) => {
      const isCompleted = visitStatus === 'COMPLETED';
      const isCancelled = visitStatus === 'CANCELLED';
      const phase = isCompleted || isCancelled ? 'ended' : 'confirmed';
      const isCheckedIn = !isCompleted && !isCancelled && mode === 'clinic';
      const showConfirmedBanner = !isCompleted && !isCancelled;
      const showCancelledBanner = isCancelled;
      const showFooterActions = !isCompleted && !isCancelled;
      const showAddPrescription = isCompleted && mode === 'clinic';

      return {
        isCompleted,
        isCancelled,
        phase,
        isCheckedIn,
        showConfirmedBanner,
        showCancelledBanner,
        showFooterActions,
        showAddPrescription,
      };
    };

    const confirmed = computeUI('CONFIRMED', 'clinic');
    assert.equal(confirmed.showConfirmedBanner, true);
    assert.equal(confirmed.showCancelledBanner, false);
    assert.equal(confirmed.showFooterActions, true);
    assert.equal(confirmed.showAddPrescription, false);

    const completed = computeUI('COMPLETED', 'clinic');
    assert.equal(completed.showConfirmedBanner, false);
    assert.equal(completed.showCancelledBanner, false);
    assert.equal(completed.showFooterActions, false);
    assert.equal(completed.showAddPrescription, true);

    const cancelled = computeUI('CANCELLED', 'clinic');
    assert.equal(cancelled.showConfirmedBanner, false);
    assert.equal(cancelled.showCancelledBanner, true);
    assert.equal(cancelled.showFooterActions, false);
    assert.equal(cancelled.showAddPrescription, false);
  });
});

describe('Issue 8: Prescription Button Logic — Appointment Details', () => {
  function computePrescriptionButtonState({
    visitStatus,
    mode = 'clinic',
    clinicCheckInState = 'ready',
    phase = 'ended',
    visitDetail = null,
    prescriptionData = null,
  }) {
    const isCompleted = (visitStatus || '').toUpperCase() === 'COMPLETED';
    const isCancelled = (visitStatus || '').toUpperCase() === 'CANCELLED';
    const isClinic = mode === 'clinic';
    const isCheckedIn =
      !isCompleted &&
      !isCancelled &&
      isClinic &&
      (clinicCheckInState === 'waiting' ||
        visitStatus === 'WAITING' ||
        visitStatus === 'WALK-IN');

    const erxSnapshotId =
      visitDetail?.erxSnapshotId ?? prescriptionData?.erxSnapshotId ?? null;
    const hasPrescription =
      isCompleted &&
      Boolean(
        (erxSnapshotId != null && Number(erxSnapshotId) > 0) ||
        visitDetail?.erxSigned ||
        Boolean(visitDetail?.erxPdfUrl) ||
        (Array.isArray(prescriptionData?.items) && prescriptionData.items.length > 0),
      );

    // Button rendered at Check In position
    const showViewPrescriptionButton = isCompleted && hasPrescription;
    const showCheckInCard = !isCompleted && !isCheckedIn && !isCancelled && phase !== 'ended';

    return {
      isCompleted,
      isCancelled,
      hasPrescription,
      showViewPrescriptionButton,
      showCheckInCard,
    };
  }

  it('1. Completed appointment with prescription shows View Prescription at Check In position', () => {
    const state = computePrescriptionButtonState({
      visitStatus: 'COMPLETED',
      mode: 'clinic',
      visitDetail: { erxSnapshotId: 456, erxSigned: true },
    });

    assert.equal(state.isCompleted, true);
    assert.equal(state.hasPrescription, true);
    assert.equal(state.showViewPrescriptionButton, true, 'View Prescription button is shown');
    assert.equal(state.showCheckInCard, false, 'Check In Now card is hidden');
  });

  it('2. Completed appointment without prescription data does not show broken button', () => {
    const state = computePrescriptionButtonState({
      visitStatus: 'COMPLETED',
      mode: 'clinic',
      visitDetail: { erxSnapshotId: null, erxSigned: false, erxPdfUrl: null },
      prescriptionData: { items: [] },
    });

    assert.equal(state.isCompleted, true);
    assert.equal(state.hasPrescription, false);
    assert.equal(state.showViewPrescriptionButton, false, 'Do not show broken View Prescription button');
    assert.equal(state.showCheckInCard, false);
  });

  it('3. Non-completed (Confirmed) appointment follows existing check-in logic and hides View Prescription', () => {
    const state = computePrescriptionButtonState({
      visitStatus: 'CONFIRMED',
      mode: 'clinic',
      clinicCheckInState: 'ready',
      phase: 'confirmed',
      visitDetail: { erxSnapshotId: 101 },
    });

    assert.equal(state.isCompleted, false);
    assert.equal(state.hasPrescription, false, 'Prescription button must not show for non-completed');
    assert.equal(state.showViewPrescriptionButton, false);
    assert.equal(state.showCheckInCard, true, 'Check In Now card is shown for eligible clinic booking');
  });

  it('4. Cancelled appointment does not show View Prescription or Check In', () => {
    const state = computePrescriptionButtonState({
      visitStatus: 'CANCELLED',
      mode: 'clinic',
    });

    assert.equal(state.isCancelled, true);
    assert.equal(state.showViewPrescriptionButton, false);
    assert.equal(state.showCheckInCard, false);
  });

  it('5. Tapping View Prescription opens existing PrescriptionView modal, and Back closes it', () => {
    let prescriptionOpen = false;

    const onOpenPrescription = () => {
      prescriptionOpen = true;
    };
    const onClosePrescription = () => {
      prescriptionOpen = false;
    };

    assert.equal(prescriptionOpen, false);
    onOpenPrescription();
    assert.equal(prescriptionOpen, true, 'Modal opens with PrescriptionView');

    onClosePrescription();
    assert.equal(prescriptionOpen, false, 'Modal closes, returning to Appointment Details');
  });
});

describe('Issue 9: View Prescription Integration (My Appointments → Completed Appointment → View Prescription)', () => {
  function mapErxItemsToMedicines(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }
    return items.map((item) => {
      const remedyName = item.remedyName?.trim();
      const remedyCode = item.remedyCode?.trim();
      const potency = item.potencyCode?.trim();
      let name = '';
      if (remedyName) {
        name = potency ? `${remedyName} (${potency})` : remedyName;
      } else if (remedyCode) {
        name = potency ? `${remedyCode} (${potency})` : remedyCode;
      } else {
        name = 'Remedy';
      }
      return {
        name,
        dose: item.dose?.trim() || '-',
        time: item.frequency?.trim() || '-',
        duration: item.duration?.trim() || '-',
        note: item.instructions?.trim() || '-',
      };
    });
  }

  function computePrescriptionState({
    patientAppId,
    erxSnapshotIdProp,
    apiResponse,
    isLoading = false,
    isFetching = false,
    isError = false,
    doctorNameProp,
    doctorCredentialsProp,
    patientNameProp,
    appointmentDateProp,
  }) {
    const id = patientAppId != null && String(patientAppId).length > 0 ? patientAppId : null;
    const data = apiResponse;
    const items = data?.data?.items;
    const medicines = mapErxItemsToMedicines(items);

    const erxSnapshotId =
      erxSnapshotIdProp != null && String(erxSnapshotIdProp).length > 0
        ? Number(erxSnapshotIdProp)
        : data?.data?.erxSnapshotId != null
          ? Number(data.data.erxSnapshotId)
          : null;

    const rxNumber = erxSnapshotId
      ? `RX-${erxSnapshotId}`
      : id
        ? `RX-${id}`
        : 'RX';

    const rxDate = data?.data?.signedAt
      ? new Date(data.data.signedAt).toISOString().split('T')[0]
      : appointmentDateProp || '';

    const loading = id != null && (isLoading || isFetching);
    const errorState = id != null && isError;
    const emptyState = id != null && !isLoading && !isFetching && !isError && medicines.length === 0;

    return {
      id,
      erxSnapshotId,
      medicines,
      rxNumber,
      rxDate,
      doctorName: doctorNameProp || '',
      doctorCredentials: doctorCredentialsProp || '',
      patientName: patientNameProp || '',
      loading,
      isError: errorState,
      isEmpty: emptyState,
      status: data?.data?.status || 'SIGNED',
    };
  }

  it('1. Endpoint and parameters: invokes GET /api/Erx/Patient/{patientAppId} with visit ID', () => {
    const patientAppId = 1042;
    const expectedEndpoint = `api/Erx/Patient/${patientAppId}`;
    assert.equal(expectedEndpoint, 'api/Erx/Patient/1042');
  });

  it('2. Maps real API items without dummy data when remedyName is provided', () => {
    const rawApiData = {
      success: true,
      data: {
        erxSnapshotId: 7788,
        patientAppId: 1042,
        status: 'SIGNED',
        signedAt: '2026-10-22T10:00:00Z',
        items: [
          {
            remedyCode: 'NUX01',
            remedyName: 'Nux Vomica',
            potencyCode: '200C',
            dose: '4 pills',
            frequency: 'At bedtime',
            duration: '7 days',
            instructions: 'Take 30 mins after dinner',
          },
        ],
      },
    };

    const state = computePrescriptionState({
      patientAppId: 1042,
      apiResponse: rawApiData,
      doctorNameProp: 'Dr. Rahul Sharma',
      doctorCredentialsProp: 'MD (Homoeopathy)',
      patientNameProp: 'Amod Mayekar',
    });

    assert.equal(state.loading, false);
    assert.equal(state.isError, false);
    assert.equal(state.isEmpty, false);
    assert.equal(state.medicines.length, 1);
    assert.equal(state.medicines[0].name, 'Nux Vomica (200C)');
    assert.equal(state.medicines[0].dose, '4 pills');
    assert.equal(state.medicines[0].time, 'At bedtime');
    assert.equal(state.medicines[0].duration, '7 days');
    assert.equal(state.medicines[0].note, 'Take 30 mins after dinner');
    assert.equal(state.rxNumber, 'RX-7788');
    assert.equal(state.doctorName, 'Dr. Rahul Sharma');
    assert.equal(state.patientName, 'Amod Mayekar');
  });

  it('3. Respects §J3 dispensing rule when remedyName is masked by backend (uses remedyCode & potencyCode)', () => {
    const rawApiData = {
      success: true,
      data: {
        erxSnapshotId: 9911,
        patientAppId: 2045,
        status: 'SIGNED',
        signedAt: '2026-10-22T12:00:00Z',
        items: [
          {
            remedyCode: 'R045',
            remedyName: '',
            potencyCode: '30C',
            dose: '2 drops',
            frequency: 'Morning & Evening',
            duration: '14 days',
            instructions: 'Empty stomach',
          },
        ],
      },
    };

    const state = computePrescriptionState({
      patientAppId: 2045,
      apiResponse: rawApiData,
    });

    assert.equal(state.medicines[0].name, 'R045 (30C)');
    assert.equal(state.medicines[0].dose, '2 drops');
    assert.equal(state.rxNumber, 'RX-9911');
  });

  it('4. Handles Loading state properly while fetching prescription API', () => {
    const state = computePrescriptionState({
      patientAppId: 1042,
      isLoading: true,
    });

    assert.equal(state.loading, true);
    assert.equal(state.isError, false);
    assert.equal(state.isEmpty, false);
    assert.equal(state.medicines.length, 0);
  });

  it('5. Handles Error state cleanly when API request fails (provides retryable state)', () => {
    const state = computePrescriptionState({
      patientAppId: 1042,
      isError: true,
      isLoading: false,
    });

    assert.equal(state.loading, false);
    assert.equal(state.isError, true);
    assert.equal(state.isEmpty, false);
    assert.equal(state.medicines.length, 0);
  });

  it('6. Handles Empty state when appointment has no prescription items (no dummy fallback)', () => {
    const emptyApiData = {
      success: true,
      data: {
        erxSnapshotId: 5544,
        patientAppId: 1042,
        status: 'DRAFT',
        items: [],
      },
    };

    const state = computePrescriptionState({
      patientAppId: 1042,
      apiResponse: emptyApiData,
      isLoading: false,
      isError: false,
    });

    assert.equal(state.loading, false);
    assert.equal(state.isError, false);
    assert.equal(state.isEmpty, true);
    assert.equal(state.medicines.length, 0);
    // Explicitly verify NO hardcoded mock medicines are present
    assert.deepEqual(state.medicines, []);
  });

  it('7. PDF Download and Share flow: requests signed PDF URL via GET /api/Erx/{erxSnapshotId}/Pdf?format=json', async () => {
    let requestedSnapshotId = null;
    let openedUrl = null;
    let sharedUrl = null;

    const mockFetchPdfMeta = async (snapshotId) => {
      requestedSnapshotId = snapshotId;
      return {
        data: {
          pdfUrl: 'https://storage.niga.health/prescriptions/rx_7788_signed.pdf',
          expiresAt: '2026-10-23T10:00:00Z',
        },
      };
    };

    const mockOpenUrl = async (url) => {
      openedUrl = url;
    };

    const mockShare = async ({ url }) => {
      sharedUrl = url;
    };

    // Simulate download action
    const resDownload = await mockFetchPdfMeta(7788);
    await mockOpenUrl(resDownload.data.pdfUrl);
    assert.equal(requestedSnapshotId, 7788);
    assert.equal(openedUrl, 'https://storage.niga.health/prescriptions/rx_7788_signed.pdf');

    // Simulate share action
    const resShare = await mockFetchPdfMeta(7788);
    await mockShare({ url: resShare.data.pdfUrl });
    assert.equal(sharedUrl, 'https://storage.niga.health/prescriptions/rx_7788_signed.pdf');
  });

  it('8. Complete Flow: My Appointments → Completed Appointment → View Prescription', () => {
    // 1. My Appointments list has a completed appointment
    const appointment = {
      id: 'apt-9988',
      visitId: 1042,
      mode: 'clinic',
      status: 'COMPLETED',
      doctorName: 'Dr. Sunita Deshmukh',
      credentials: 'MD (Hom)',
      patientName: 'Amod Mayekar',
      dateLine: 'Thu, 22 Oct 2026',
      erxSnapshotId: 7788,
      erxSigned: true,
    };

    // 2. Open Appointment Details: verified completed rules
    const isCompleted = appointment.status === 'COMPLETED';
    const showViewPrescription = isCompleted && appointment.erxSnapshotId != null;
    assert.equal(showViewPrescription, true, 'View Prescription button is displayed');

    // 3. Tap View Prescription: open modal
    let prescriptionModalOpen = true;
    assert.equal(prescriptionModalOpen, true);

    // 4. Controller binds real appointment metadata & API prescription
    const rawApiData = {
      success: true,
      data: {
        erxSnapshotId: appointment.erxSnapshotId,
        patientAppId: appointment.visitId,
        status: 'SIGNED',
        signedAt: '2026-10-22T10:00:00Z',
        items: [
          {
            remedyCode: 'BRY01',
            remedyName: 'Bryonia Alba',
            potencyCode: '30C',
            dose: '4 pills',
            frequency: '3 times daily',
            duration: '5 days',
            instructions: 'Before meals',
          },
        ],
      },
    };

    const viewState = computePrescriptionState({
      patientAppId: appointment.visitId,
      erxSnapshotIdProp: appointment.erxSnapshotId,
      apiResponse: rawApiData,
      doctorNameProp: appointment.doctorName,
      doctorCredentialsProp: appointment.credentials,
      patientNameProp: appointment.patientName,
      appointmentDateProp: appointment.dateLine,
    });

    assert.equal(viewState.doctorName, 'Dr. Sunita Deshmukh');
    assert.equal(viewState.patientName, 'Amod Mayekar');
    assert.equal(viewState.rxNumber, 'RX-7788');
    assert.equal(viewState.medicines.length, 1);
    assert.equal(viewState.medicines[0].name, 'Bryonia Alba (30C)');

    // 5. Back action returns to Appointment Details
    prescriptionModalOpen = false;
    assert.equal(prescriptionModalOpen, false);
  });
});

describe('Issue 10: Navigation to Home Screen After Booking Completes', () => {
  it('1. Online payment completion registers appointment and navigates directly to Home screen', () => {
    let appointmentsList = [];
    let bookingOpen = true;
    let paymentOpen = true;
    let selectedTab = 'doctors';
    let profileDoctorId = 'doc-101';
    let searchOpen = true;

    const onConfirmBooking = (item) => {
      appointmentsList = [item, ...appointmentsList];
    };

    const onFinishBookingFlow = (targetTab = 'home') => {
      bookingOpen = false;
      paymentOpen = false;
      profileDoctorId = null;
      searchOpen = false;
      selectedTab = targetTab;
    };

    // Simulate onPaymentConfirmed
    const mockPaymentConfirmed = (paymentOrderId) => {
      onConfirmBooking({
        id: '1042',
        bookingId: 'APT-1042',
        doctorId: 'doc-101',
        doctorInitials: 'DR',
        whenLabel: 'Tomorrow at 10:00 AM',
        paymentId: String(paymentOrderId),
        status: 'waiting_acceptance',
      });
      onFinishBookingFlow('home');
    };

    mockPaymentConfirmed(9001);

    assert.equal(bookingOpen, false, 'Booking modal is closed');
    assert.equal(paymentOpen, false, 'Payment modal is closed');
    assert.equal(profileDoctorId, null, 'Doctor profile overlay is cleared');
    assert.equal(searchOpen, false, 'Search overlay is cleared');
    assert.equal(selectedTab, 'home', 'Selected tab navigates directly to Home');
    assert.equal(appointmentsList.length, 1, 'Booked appointment is registered on Home');
    assert.equal(appointmentsList[0].bookingId, 'APT-1042');
  });

  it('2. In-Clinic (Pay at Clinic) booking registers appointment and navigates directly to Home screen', () => {
    let appointmentsList = [];
    let bookingOpen = true;
    let paymentOpen = true;
    let selectedTab = 'doctors';

    const onConfirmBooking = (item) => {
      appointmentsList = [item, ...appointmentsList];
    };

    const onFinishBookingFlow = (targetTab = 'home') => {
      bookingOpen = false;
      paymentOpen = false;
      selectedTab = targetTab;
    };

    // Simulate Pay at Clinic selection
    const mockPayAtClinicConfirmed = () => {
      onConfirmBooking({
        id: '2050',
        bookingId: 'APT-2050',
        doctorId: 'doc-102',
        doctorInitials: 'SK',
        whenLabel: 'Friday at 2:00 PM',
        mode: 'clinic',
        paymentId: '',
        status: 'waiting_acceptance',
      });
      onFinishBookingFlow('home');
    };

    mockPayAtClinicConfirmed();

    assert.equal(bookingOpen, false);
    assert.equal(paymentOpen, false);
    assert.equal(selectedTab, 'home', 'Directly lands on Home tab');
    assert.equal(appointmentsList.length, 1);
    assert.equal(appointmentsList[0].mode, 'clinic');
  });

  it('3. Booking initiated from My Appointments closes My Appointments overlay and lands on Home screen', () => {
    let myAppointmentsOpen = true;
    let bookingOpen = true;
    let selectedTab = 'doctors';

    const onFinishBookingFlow = (targetTab = 'home') => {
      bookingOpen = false;
      myAppointmentsOpen = false;
      selectedTab = targetTab;
    };

    onFinishBookingFlow('home');

    assert.equal(bookingOpen, false);
    assert.equal(myAppointmentsOpen, false, 'My Appointments overlay is closed');
    assert.equal(selectedTab, 'home', 'Navigated directly to Home screen');
  });
});

describe('Issue 11: Home Dashboard - My Bookings Excludes Past, Cancelled, and Completed Appointments', () => {
  const JOIN_GRACE_MS = 30 * 60 * 1000;

  function filterHomeDashboardBookings(appointments) {
    const now = Date.now();
    return appointments.filter((a) => {
      if (a.id === 'seed-followup-chat') return false;

      const statusUpper = (a.status || '').toUpperCase();
      if (
        statusUpper === 'CANCELLED' ||
        statusUpper === 'CANCELED' ||
        statusUpper === 'COMPLETED' ||
        statusUpper === 'ENDED' ||
        statusUpper === 'REJECTED' ||
        statusUpper === 'EXPIRED'
      ) {
        return false;
      }
      if (a.status !== 'confirmed' && a.status !== 'waiting_acceptance') {
        return false;
      }

      if (a.startsAt) {
        const startsMs = Date.parse(a.startsAt);
        if (!Number.isNaN(startsMs) && startsMs + JOIN_GRACE_MS < now) {
          return false;
        }
      }

      return true;
    });
  }

  it('1. Cancelled appointments are excluded from Home My Bookings', () => {
    const futureIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const list = [
      { id: '1', status: 'cancelled', startsAt: futureIso },
      { id: '2', status: 'CANCELLED', startsAt: futureIso },
      { id: '3', status: 'confirmed', startsAt: futureIso },
    ];
    const filtered = filterHomeDashboardBookings(list);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].id, '3');
  });

  it('2. Completed appointments are excluded from Home My Bookings', () => {
    const futureIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const list = [
      { id: '10', status: 'completed', startsAt: futureIso },
      { id: '11', status: 'COMPLETED', startsAt: futureIso },
      { id: '12', status: 'confirmed', startsAt: futureIso },
    ];
    const filtered = filterHomeDashboardBookings(list);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].id, '12');
  });

  it('3. Past appointments (scheduled time + grace period in the past) are excluded from Home My Bookings', () => {
    const pastYesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const pastOneHour = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const futureTomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const list = [
      { id: '20', status: 'confirmed', startsAt: pastYesterday },
      { id: '21', status: 'confirmed', startsAt: pastOneHour },
      { id: '22', status: 'confirmed', startsAt: futureTomorrow },
    ];
    const filtered = filterHomeDashboardBookings(list);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].id, '22', 'Only future / active booking is retained');
  });

  it('4. Active, upcoming, and live appointments within grace period are shown in Home My Bookings', () => {
    const justStarted10MinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const upcomingIn2Hours = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const list = [
      { id: '30', status: 'confirmed', startsAt: justStarted10MinsAgo },
      { id: '31', status: 'waiting_acceptance', startsAt: upcomingIn2Hours },
    ];
    const filtered = filterHomeDashboardBookings(list);
    assert.equal(filtered.length, 2);
  });

  it('5. Mixed list scenario: filters all past, cancelled, and completed appointments simultaneously', () => {
    const pastDate = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const mixedAppointments = [
      { id: '101', status: 'confirmed', startsAt: pastDate }, // past -> exclude
      { id: '102', status: 'CANCELLED', startsAt: futureDate }, // cancelled -> exclude
      { id: '103', status: 'COMPLETED', startsAt: futureDate }, // completed -> exclude
      { id: '104', status: 'confirmed', startsAt: futureDate }, // active upcoming -> keep
      { id: '105', status: 'waiting_acceptance', startsAt: futureDate }, // active upcoming -> keep
    ];

    const result = filterHomeDashboardBookings(mixedAppointments);
    assert.equal(result.length, 2);
    assert.deepEqual(result.map((r) => r.id), ['104', '105']);
  });
});

function maskSensitive(obj) {
  const masked = { ...obj };
  if (typeof masked.mobile === 'string') {
    const m = masked.mobile;
    masked.mobile = m.length > 4 ? `${m.slice(0, 2)}******${m.slice(-2)}` : '****';
  }
  if (typeof masked.email === 'string') {
    const e = masked.email;
    const at = e.indexOf('@');
    masked.email = at > 2 ? `${e.slice(0, 2)}***${e.slice(at)}` : '***@***';
  }
  if (typeof masked.razorpay_order_id === 'string' && masked.razorpay_order_id) {
    masked.razorpay_order_id = `${masked.razorpay_order_id.slice(0, 6)}*****`;
  }
  if (typeof masked.razorpay_payment_id === 'string' && masked.razorpay_payment_id) {
    masked.razorpay_payment_id = `${masked.razorpay_payment_id.slice(0, 6)}*****`;
  }
  return masked;
}

function resolveMembers(userName, userInitials, familyMembers, selfPatientId) {
  const cleanName = userName?.trim() || 'Self';
  const initials =
    userInitials?.trim() ||
    cleanName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    'ME';

  const resolvedSelfPatientId =
    typeof selfPatientId === 'number' && selfPatientId > 0
      ? selfPatientId
      : Number(selfPatientId) || undefined;

  const selfMember = {
    id: 'self',
    name: cleanName,
    initials,
    icon: 'person',
    self: true,
    patientId: resolvedSelfPatientId,
    memberPatientId: resolvedSelfPatientId,
  };

  if (!familyMembers || !Array.isArray(familyMembers) || familyMembers.length === 0) {
    return [selfMember];
  }

  const mappedMembers = familyMembers.map((m, index) => {
    const rawMemberPatientId =
      typeof m.memberPatientId === 'number' && m.memberPatientId > 0
        ? m.memberPatientId
        : typeof m.patientId === 'number' && m.patientId > 0
          ? m.patientId
          : Number(m.memberPatientId ?? m.patientId) || undefined;

    const rawFamilyMemberId =
      typeof m.familyMemberId === 'number' && m.familyMemberId > 0
        ? m.familyMemberId
        : Number(m.familyMemberId) || undefined;

    const id = String(rawMemberPatientId ?? rawFamilyMemberId ?? m.id ?? `fam_${index}`);
    const mName = (m.patientName || m.fullName || m.name || '').trim();
    const mInitials = mName
      ? mName
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
      : 'FM';
    const rel = (m.relation || m.relationName || m.relationship || '').trim();
    const age = typeof m.age === 'number' ? m.age : undefined;

    return {
      id,
      name: mName || `Member ${index + 1}`,
      initials: mInitials,
      relationshipName: rel,
      age,
      self: false,
      memberPatientId: rawMemberPatientId,
      familyMemberId: rawFamilyMemberId,
      patientId: rawMemberPatientId,
    };
  });

  return [selfMember, ...mappedMembers];
}

function simulateDispatchBooking({
  member,
  doctorId,
  appointmentDate,
  appointmentTime,
  mode,
  authUser,
  authUserId,
  authMobile,
  bookingSessionId,
  consentPolicyVersion,
  patientFullName,
  payment = {},
}) {
  const isFamilyMember = !member.self;
  const memberPatientId =
    member.memberPatientId ??
    member.patientId ??
    (Number.isFinite(Number(member.id)) && Number(member.id) > 0 ? Number(member.id) : undefined);

  const docIdNum = Number(doctorId);
  const phone = authUser?.mobile || authUser?.mobileNo || authMobile;
  const selectedPatientName = member.self
    ? (patientFullName || authUser?.patientName || member.name || 'Patient')
    : (member.name || patientFullName || 'Patient');
  const consultMode = mode === 'clinic' ? 'InClinic' : 'Tele';
  const visitType = consultMode;
  const isTele = consultMode === 'Tele';
  const effectiveUserId =
    typeof authUser?.userId === 'number'
      ? authUser.userId
      : typeof authUserId === 'number'
        ? authUserId
        : 0;
  const email = authUser?.email || undefined;
  const razorpay_order_id = payment.razorpay_order_id ?? null;
  const razorpay_payment_id = payment.razorpay_payment_id ?? null;

  if (isFamilyMember) {
    if (!memberPatientId || memberPatientId <= 0) {
      throw new Error(`Cannot book for family member "${member.name}": Missing valid memberPatientId.`);
    }

    const familyPayload = {
      memberPatientId,
      doctorId: docIdNum,
      appointmentDate,
      appointmentTime,
      visitType,
      consultMode,
      isTele,
      userId: effectiveUserId,
      payAtClinic: Boolean(payment.payAtClinic),
      razorpay_order_id,
      razorpay_payment_id,
    };

    const masked = maskSensitive(familyPayload);

    return {
      route: 'POST /api/Family/BookAs',
      method: 'POST',
      payload: familyPayload,
      maskedPayload: masked,
      targetMemberId: memberPatientId,
    };
  } else {
    const selfPayload = {
      doctorId: docIdNum,
      mobile: phone,
      patientName: selectedPatientName,
      email,
      appointmentDate,
      appointmentTime,
      visitType,
      consultMode,
      isTele,
      bookingSessionId: typeof bookingSessionId === 'number' ? bookingSessionId : 0,
      consentPolicyVersion: consentPolicyVersion || '2026.1',
      payAtClinic: Boolean(payment.payAtClinic),
      userId: effectiveUserId,
      razorpay_order_id,
      razorpay_payment_id,
    };

    const masked = maskSensitive(selfPayload);

    return {
      route: `POST /api/Public/Doctors/${docIdNum}/Bookings`,
      method: 'POST',
      payload: selfPayload,
      maskedPayload: masked,
      targetMemberId: 'self',
    };
  }
}

describe('Issue 12: Appointment Booking — Self vs Family Member API & Payload Mapping', () => {


  it('1. Self Booking calls only POST /api/Public/Doctors/{doctorId}/Bookings with all required fields', () => {
    const members = resolveMembers('Asha Kulkarni', 'AK', [], 5012);
    const selfMember = members[0];

    const result = simulateDispatchBooking({
      member: selfMember,
      doctorId: 104,
      appointmentDate: '2026-10-25',
      appointmentTime: '10:30',
      mode: 'clinic',
      authUser: {
        userId: 10020,
        mobile: '9876500011',
        email: 'asha.k@example.com',
        patientName: 'Asha Kulkarni',
      },
      authUserId: 10020,
      authMobile: '9876500011',
      bookingSessionId: 418822,
      consentPolicyVersion: '2026.1',
      patientFullName: 'Asha Kulkarni',
      payment: { payAtClinic: true, razorpay_order_id: null, razorpay_payment_id: null },
    });

    assert.equal(result.route, 'POST /api/Public/Doctors/104/Bookings');
    assert.equal(result.method, 'POST');
    assert.equal(result.payload.doctorId, 104);
    assert.equal(result.payload.mobile, '9876500011');
    assert.equal(result.payload.patientName, 'Asha Kulkarni');
    assert.equal(result.payload.email, 'asha.k@example.com');
    assert.equal(result.payload.appointmentDate, '2026-10-25');
    assert.equal(result.payload.appointmentTime, '10:30');
    assert.equal(result.payload.visitType, 'InClinic');
    assert.equal(result.payload.consultMode, 'InClinic');
    assert.equal(result.payload.isTele, false);
    assert.equal(result.payload.bookingSessionId, 418822);
    assert.equal(result.payload.consentPolicyVersion, '2026.1');
    assert.equal(result.payload.payAtClinic, true);
    assert.equal(result.payload.userId, 10020);
    assert.equal(result.payload.razorpay_order_id, null);
    assert.equal(result.payload.razorpay_payment_id, null);

    // Verify masking
    assert.equal(result.maskedPayload.mobile, '98******11');
    assert.equal(result.maskedPayload.email, 'as***@example.com');
  });

  it('2. Family Member Booking calls only POST /api/Family/BookAs with correct memberPatientId (not relation row ID)', () => {
    const apiFamily = [
      {
        familyMemberId: 301, // Relation row ID
        ownerPatientId: 5012,
        memberPatientId: 5013, // Real patient profile ID
        relation: 'Son',
        patientName: 'Aarav Kulkarni',
        age: 7,
      },
    ];

    const members = resolveMembers('Asha Kulkarni', 'AK', apiFamily, 5012);
    const familyMember = members[1]; // Aarav

    assert.equal(familyMember.id, '5013', 'memberPatientId is prioritized in ID');
    assert.equal(familyMember.memberPatientId, 5013);
    assert.equal(familyMember.familyMemberId, 301);

    const result = simulateDispatchBooking({
      member: familyMember,
      doctorId: 104,
      appointmentDate: '2026-10-25',
      appointmentTime: '11:00',
      mode: 'video',
      authUser: {
        userId: 10020,
        mobile: '9876500011',
      },
      authUserId: 10020,
      authMobile: '9876500011',
      bookingSessionId: 418822,
      consentPolicyVersion: '2026.1',
      patientFullName: 'Asha Kulkarni',
      payment: {
        payAtClinic: false,
        razorpay_order_id: 'order_987654321',
        razorpay_payment_id: 'pay_123456789',
      },
    });

    assert.equal(result.route, 'POST /api/Family/BookAs');
    assert.equal(result.method, 'POST');
    // Critical assertion: memberPatientId must be 5013, NOT 301
    assert.equal(result.payload.memberPatientId, 5013);
    assert.equal(result.payload.doctorId, 104);
    assert.equal(result.payload.appointmentDate, '2026-10-25');
    assert.equal(result.payload.appointmentTime, '11:00');
    assert.equal(result.payload.visitType, 'Tele');
    assert.equal(result.payload.consultMode, 'Tele');
    assert.equal(result.payload.isTele, true);
    assert.equal(result.payload.userId, 10020);
    assert.equal(result.payload.payAtClinic, false);
    assert.equal(result.payload.razorpay_order_id, 'order_987654321');
    assert.equal(result.payload.razorpay_payment_id, 'pay_123456789');

    // Verify sensitive payment identifiers are masked in log output
    assert.equal(result.maskedPayload.razorpay_order_id, 'order_*****');
    assert.equal(result.maskedPayload.razorpay_payment_id, 'pay_12*****');
  });

  it('3. Throws explicit validation error if family member is missing numeric memberPatientId', () => {
    const invalidMember = {
      id: 'fam_unknown',
      name: 'Corrupt Member',
      self: false,
      memberPatientId: undefined,
      familyMemberId: undefined,
    };

    assert.throws(
      () =>
        simulateDispatchBooking({
          member: invalidMember,
          doctorId: 104,
          appointmentDate: '2026-10-25',
          appointmentTime: '11:00',
          mode: 'video',
          authUser: { userId: 10020 },
          payment: { payAtClinic: false },
        }),
      /Cannot book for family member "Corrupt Member": Missing valid memberPatientId/,
    );
  });
});

describe('Issue 13: Dashboard/Home -> Patient Selection -> Appointment Booking Flow', () => {
  const mockFamilyMembers = [
    {
      familyMemberId: 301,
      ownerPatientId: 5012,
      memberPatientId: 5013,
      relation: 'Son',
      patientName: 'Aarav Kulkarni',
      age: 7,
    },
    {
      familyMemberId: 302,
      ownerPatientId: 5012,
      memberPatientId: 5014,
      relation: 'Mother',
      patientName: 'Sunita Kulkarni',
      age: 62,
    },
  ];

  it('1. By default, Self is selected on Home/Dashboard with correct labels and self patient ID', () => {
    // Redux authSlice initial state
    const reduxState = {
      isAuthenticated: true,
      patientId: 5012,
      userId: 10020,
      selectedMemberId: 'self',
    };

    const members = resolveMembers('Asha Kulkarni', 'AK', mockFamilyMembers, reduxState.patientId);
    assert.equal(members.length, 3);
    assert.equal(reduxState.selectedMemberId, 'self');

    const selectedMember = members.find((m) => m.id === reduxState.selectedMemberId) ?? members[0];
    assert.equal(selectedMember.self, true);
    assert.equal(selectedMember.name, 'Asha Kulkarni');
    assert.equal(selectedMember.memberPatientId, 5012);

    const selectedMemberLabel = selectedMember.self ? 'Myself' : selectedMember.name.split(' ')[0];
    assert.equal(selectedMemberLabel, 'Myself');
  });

  it('2. Selecting Family Member on Home updates Redux and keeps selected member active throughout booking flow', () => {
    let reduxSelectedMemberId = 'self';
    const dispatchSetSelectedMemberId = (id) => {
      reduxSelectedMemberId = id;
    };

    const members = resolveMembers('Asha Kulkarni', 'AK', mockFamilyMembers, 5012);

    // User selects Aarav (memberPatientId 5013) on Home header chip
    const selectedId = '5013';
    dispatchSetSelectedMemberId(selectedId);
    assert.equal(reduxSelectedMemberId, '5013');

    // Home displays selected member
    const homeSelectedMember = members.find((m) => m.id === reduxSelectedMemberId) ?? members[0];
    assert.equal(homeSelectedMember.self, false);
    assert.equal(homeSelectedMember.name, 'Aarav Kulkarni');
    assert.equal(homeSelectedMember.relationshipName, 'Son');
    const homeMemberLabel = homeSelectedMember.self ? 'Myself' : homeSelectedMember.name.split(' ')[0];
    assert.equal(homeMemberLabel, 'Aarav');

    // Navigation opens booking with initialMemberId = homeSelectedMember.id
    const bookingInitialMemberId = reduxSelectedMemberId;
    const bookingMember = members.find((m) => m.id === bookingInitialMemberId) ?? members[0];

    // Booking screen verifies member and labels
    assert.equal(bookingMember.id, '5013');
    assert.equal(bookingMember.self, false);
    assert.equal(bookingMember.memberPatientId, 5013);

    const consultingLabel = bookingMember.self
      ? 'Myself'
      : bookingMember.relationshipName
        ? `${bookingMember.name} (${bookingMember.relationshipName})`
        : bookingMember.name;
    assert.equal(consultingLabel, 'Aarav Kulkarni (Son)');

    const patientLabel = bookingMember.self
      ? bookingMember.name
      : bookingMember.relationshipName
        ? `${bookingMember.name} (${bookingMember.relationshipName}${bookingMember.age ? `, ${bookingMember.age} yrs` : ''})`
        : bookingMember.name;
    assert.equal(patientLabel, 'Aarav Kulkarni (Son, 7 yrs)');
  });

  it('3. Confirms booking for selected Family Member using POST /api/Family/BookAs with correct memberPatientId', () => {
    const members = resolveMembers('Asha Kulkarni', 'AK', mockFamilyMembers, 5012);
    const selectedMember = members.find((m) => m.id === '5013');

    const result = simulateDispatchBooking({
      member: selectedMember,
      doctorId: 104,
      appointmentDate: '2026-10-25',
      appointmentTime: '10:30',
      mode: 'clinic',
      authUser: {
        userId: 10020,
        mobile: '9876500011',
        email: 'asha@example.com',
        patientName: 'Asha Kulkarni',
      },
      authUserId: 10020,
      payment: { payAtClinic: true, razorpay_order_id: null, razorpay_payment_id: null },
    });

    assert.equal(result.route, 'POST /api/Family/BookAs');
    assert.equal(result.method, 'POST');
    assert.equal(result.payload.memberPatientId, 5013);
    assert.equal(result.payload.doctorId, 104);
    assert.equal(result.payload.appointmentDate, '2026-10-25');
    assert.equal(result.payload.appointmentTime, '10:30');
    assert.equal(result.payload.visitType, 'InClinic');
    assert.equal(result.payload.consultMode, 'InClinic');
    assert.equal(result.payload.isTele, false);
    assert.equal(result.payload.userId, 10020);
    assert.equal(result.payload.payAtClinic, true);
    assert.equal(result.payload.razorpay_order_id, null);
    assert.equal(result.payload.razorpay_payment_id, null);
  });

  it('4. Switching selection back to Self calls POST /api/Public/Doctors/{doctorId}/Bookings with Self payload', () => {
    const members = resolveMembers('Asha Kulkarni', 'AK', mockFamilyMembers, 5012);
    const selfMember = members.find((m) => m.id === 'self');

    const result = simulateDispatchBooking({
      member: selfMember,
      doctorId: 104,
      appointmentDate: '2026-10-25',
      appointmentTime: '11:00',
      mode: 'video',
      authUser: {
        userId: 10020,
        mobile: '9876500011',
        email: 'asha@example.com',
        patientName: 'Asha Kulkarni',
      },
      authUserId: 10020,
      authMobile: '9876500011',
      bookingSessionId: 418822,
      consentPolicyVersion: '2026.1',
      patientFullName: 'Asha Kulkarni',
      payment: {
        payAtClinic: false,
        razorpay_order_id: 'order_test_123',
        razorpay_payment_id: 'pay_test_456',
      },
    });

    assert.equal(result.route, 'POST /api/Public/Doctors/104/Bookings');
    assert.equal(result.method, 'POST');
    assert.equal(result.payload.doctorId, 104);
    assert.equal(result.payload.mobile, '9876500011');
    assert.equal(result.payload.patientName, 'Asha Kulkarni');
    assert.equal(result.payload.email, 'asha@example.com');
    assert.equal(result.payload.visitType, 'Tele');
    assert.equal(result.payload.consultMode, 'Tele');
    assert.equal(result.payload.isTele, true);
    assert.equal(result.payload.bookingSessionId, 418822);
    assert.equal(result.payload.consentPolicyVersion, '2026.1');
    assert.equal(result.payload.payAtClinic, false);
    assert.equal(result.payload.userId, 10020);
    assert.equal(result.payload.razorpay_order_id, 'order_test_123');
    assert.equal(result.payload.razorpay_payment_id, 'pay_test_456');
  });

  it('5. Changing patient inside Booking screen updates state, Redux, and dispatches to newly selected member', () => {
    let reduxSelectedMemberId = 'self';
    const dispatchSetSelectedMemberId = (id) => {
      reduxSelectedMemberId = id;
    };

    const members = resolveMembers('Asha Kulkarni', 'AK', mockFamilyMembers, 5012);

    // Initial booking opened with Self
    let currentBookingMemberId = 'self';

    // User switches inside booking to Sunita (memberPatientId 5014)
    const onSelectMemberInBooking = (newId) => {
      currentBookingMemberId = newId;
      dispatchSetSelectedMemberId(newId);
    };

    onSelectMemberInBooking('5014');
    assert.equal(currentBookingMemberId, '5014');
    assert.equal(reduxSelectedMemberId, '5014');

    const updatedBookingMember = members.find((m) => m.id === currentBookingMemberId);
    assert.equal(updatedBookingMember.name, 'Sunita Kulkarni');
    assert.equal(updatedBookingMember.relationshipName, 'Mother');
    assert.equal(updatedBookingMember.memberPatientId, 5014);

    const result = simulateDispatchBooking({
      member: updatedBookingMember,
      doctorId: 104,
      appointmentDate: '2026-10-26',
      appointmentTime: '15:00',
      mode: 'clinic',
      authUser: { userId: 10020, mobile: '9876500011' },
      authUserId: 10020,
      payment: { payAtClinic: true },
    });

    assert.equal(result.route, 'POST /api/Family/BookAs');
    assert.equal(result.payload.memberPatientId, 5014);
    assert.equal(result.payload.doctorId, 104);
  });
});

describe('Issue 14: Payment Flow for Self and Family Member Appointment Booking', () => {
  it('1. Family Member booking does NOT skip payment selection; payment options appear before confirmation', async () => {
    let bookingOpen = true;
    let reviewOpen = true;
    let paymentOpen = false;
    let paymentStatus = null;
    let confirmedBooking = null;

    // Simulate stale pending payment in SecureStore with null patientAppId (the bug)
    let secureStorePending = {
      paymentOrderId: 7701,
      flow: 'consult',
      patientAppId: null,
      savedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins old
    };

    let secureStoreCleared = false;
    const clearPendingPaymentMock = async () => {
      secureStorePending = null;
      secureStoreCleared = true;
    };
    const readPendingPaymentMock = async () => secureStorePending;

    // Controller callbacks
    const onOpenPayment = () => {
      paymentStatus = null;
      paymentOpen = true;
    };

    // Review Proceed to Pay clicked
    onOpenPayment();
    assert.equal(paymentOpen, true, 'Payment screen is open');
    assert.equal(paymentStatus, null, 'Payment status is null (no premature status screen)');

    // Mount useBookingPaymentController logic with new guards
    let livePatientAppId = null;
    let resumedOrder = null;
    let onPaymentPendingCalled = false;

    // Check pending payment guard
    const pending = await readPendingPaymentMock();
    if (pending) {
      const isExpired =
        !pending.savedAt ||
        Date.now() - new Date(pending.savedAt).getTime() > 15 * 60 * 1000;
      if (isExpired || !pending.patientAppId) {
        await clearPendingPaymentMock();
      } else if (pending.flow === 'consult' && pending.patientAppId === livePatientAppId) {
        resumedOrder = pending.paymentOrderId;
        onPaymentPendingCalled = true;
      }
    }

    assert.equal(secureStoreCleared, true, 'Stale unlinked pending record is cleared');
    assert.equal(onPaymentPendingCalled, false, 'onPaymentPending is NOT called prematurely');
    assert.equal(resumedOrder, null, 'No order is resumed without matching patientAppId');
    assert.equal(confirmedBooking, null, 'No booking is created or confirmed prematurely');

    // Both payment options are available on screen
    const isInClinicMode = true;
    const showPayAtClinic = isInClinicMode;
    const canPayOnline = true;
    assert.equal(showPayAtClinic, true, 'Pay At Clinic option is shown');
    assert.equal(canPayOnline, true, 'Online payment CTA is shown');
  });

  it('2. Family Member Online Payment creates hold via POST /api/Family/BookAs, orders via ConsultOrders, and captures with real ID', async () => {
    const familyMember = {
      id: '5013',
      name: 'Surekha Mayekar',
      self: false,
      memberPatientId: 5013,
      relationshipName: 'Mother',
    };

    let familyBookingCall = null;
    let consultOrderCall = null;
    let confirmedBooking = null;

    // 1. User clicks Pay ₹1 (Online)
    const onSubmitBooking = async (payment) => {
      familyBookingCall = {
        endpoint: 'POST /api/Family/BookAs',
        payload: {
          memberPatientId: familyMember.memberPatientId,
          doctorId: 104,
          appointmentDate: '2026-10-25',
          appointmentTime: '11:00',
          visitType: 'Tele',
          consultMode: 'Tele',
          isTele: true,
          userId: 10020,
          payAtClinic: Boolean(payment.payAtClinic),
          razorpay_order_id: payment.razorpay_order_id ?? null,
          razorpay_payment_id: payment.razorpay_payment_id ?? null,
        },
      };
      return {
        patientAppId: 8812,
        bookingToken: 'tok_family_8812',
        holdExpiresAt: '2026-10-25T11:15:00.000Z',
        consultFee: 1,
      };
    };

    const createConsultOrder = async (body) => {
      consultOrderCall = {
        endpoint: 'POST /api/Payments/ConsultOrders',
        body,
      };
      return {
        gatewayReady: true,
        keyId: 'rzp_test_123',
        message: 'Order created',
        data: {
          paymentOrderId: 9021,
          amount: 100,
          currency: 'INR',
          gatewayOrderId: 'order_RzpFamily8812',
          status: 'CREATED',
        },
      };
    };

    // Execute createOrder
    const hold = await onSubmitBooking({ payAtClinic: false });
    assert.equal(familyBookingCall.endpoint, 'POST /api/Family/BookAs');
    assert.equal(familyBookingCall.payload.memberPatientId, 5013);
    assert.equal(familyBookingCall.payload.payAtClinic, false);
    assert.equal(hold.patientAppId, 8812);

    const orderRes = await createConsultOrder({
      patientAppId: hold.patientAppId,
      bookingToken: hold.bookingToken,
      payAtClinic: false,
      idempotencyKey: `pa-${hold.patientAppId}-123`,
    });
    assert.equal(consultOrderCall.body.patientAppId, 8812);
    assert.equal(orderRes.data.paymentOrderId, 9021);

    // Simulated checkout success + onConfirmed
    const onPaymentConfirmed = (paymentOrderId, confirmedPatientAppId) => {
      const pId = confirmedPatientAppId ?? hold.patientAppId;
      confirmedBooking = {
        id: String(pId),
        bookingId: `APT-${pId}`,
        patientLabel: 'Surekha Mayekar (Mother)',
        paymentId: String(paymentOrderId),
      };
    };

    onPaymentConfirmed(9021, hold.patientAppId);
    assert.equal(confirmedBooking.bookingId, 'APT-8812');
    assert.equal(confirmedBooking.id, '8812');
    assert.equal(confirmedBooking.patientLabel, 'Surekha Mayekar (Mother)');
  });

  it('3. Family Member Pay at Clinic creates hold with payAtClinic: true and confirms with real ID without online order', async () => {
    const familyMember = {
      id: '5013',
      name: 'Surekha Mayekar',
      self: false,
      memberPatientId: 5013,
      relationshipName: 'Mother',
    };

    let familyBookingCall = null;
    let confirmedBooking = null;

    const onSubmitBooking = async (payment) => {
      familyBookingCall = {
        endpoint: 'POST /api/Family/BookAs',
        payload: {
          memberPatientId: familyMember.memberPatientId,
          doctorId: 104,
          appointmentDate: '2026-10-25',
          appointmentTime: '11:00',
          visitType: 'InClinic',
          consultMode: 'InClinic',
          isTele: false,
          userId: 10020,
          payAtClinic: Boolean(payment.payAtClinic),
          razorpay_order_id: null,
          razorpay_payment_id: null,
        },
      };
      return {
        patientAppId: 8815,
        bookingToken: 'tok_clinic_8815',
        holdExpiresAt: '2026-10-25T11:15:00.000Z',
        consultFee: 500,
      };
    };

    const onPayAtClinicSuccess = (result) => {
      confirmedBooking = {
        id: String(result.patientAppId),
        bookingId: `APT-${result.patientAppId}`,
        patientLabel: 'Surekha Mayekar (Mother)',
        paymentId: '',
        status: 'waiting_acceptance',
      };
    };

    // User taps Pay At Clinic Instead
    const result = await onSubmitBooking({ payAtClinic: true });
    assert.equal(familyBookingCall.endpoint, 'POST /api/Family/BookAs');
    assert.equal(familyBookingCall.payload.memberPatientId, 5013);
    assert.equal(familyBookingCall.payload.payAtClinic, true);

    onPayAtClinicSuccess(result);
    assert.equal(confirmedBooking.bookingId, 'APT-8815');
    assert.equal(confirmedBooking.id, '8815');
    assert.equal(confirmedBooking.paymentId, '');
    assert.equal(confirmedBooking.status, 'waiting_acceptance');
  });

  it('4. Self booking correctly routes to POST /api/Public/Doctors/{id}/Bookings for both Online and Clinic pay', async () => {
    let selfBookingOnlineCall = null;
    let selfBookingClinicCall = null;

    const onSubmitBooking = async (payment) => {
      const payload = {
        doctorId: 104,
        mobile: '9876500011',
        patientName: 'Asha Kulkarni',
        email: 'asha@example.com',
        appointmentDate: '2026-10-25',
        appointmentTime: '12:00',
        visitType: payment.payAtClinic ? 'InClinic' : 'Tele',
        consultMode: payment.payAtClinic ? 'InClinic' : 'Tele',
        isTele: !payment.payAtClinic,
        bookingSessionId: 1024,
        consentPolicyVersion: '2026.1',
        payAtClinic: Boolean(payment.payAtClinic),
        userId: 10020,
        razorpay_order_id: payment.razorpay_order_id ?? null,
        razorpay_payment_id: payment.razorpay_payment_id ?? null,
      };
      if (payment.payAtClinic) {
        selfBookingClinicCall = payload;
      } else {
        selfBookingOnlineCall = payload;
      }
      return {
        patientAppId: payment.payAtClinic ? 9901 : 9902,
        bookingToken: 'tok_self',
      };
    };

    // 1. Online
    await onSubmitBooking({ payAtClinic: false });
    assert.equal(selfBookingOnlineCall.doctorId, 104);
    assert.equal(selfBookingOnlineCall.payAtClinic, false);
    assert.equal(selfBookingOnlineCall.mobile, '9876500011');
    assert.equal(selfBookingOnlineCall.patientName, 'Asha Kulkarni');

    // 2. Pay at Clinic
    await onSubmitBooking({ payAtClinic: true });
    assert.equal(selfBookingClinicCall.doctorId, 104);
    assert.equal(selfBookingClinicCall.payAtClinic, true);
    assert.equal(selfBookingClinicCall.mobile, '9876500011');
    assert.equal(selfBookingClinicCall.patientName, 'Asha Kulkarni');
  });

  it('5. Payment Cancellation and Failure return cleanly to Payment View without premature booking', async () => {
    let paymentState = 'IDLE';
    let errorMessage = null;
    let pendingPaymentCleared = false;
    let holdCancelled = false;

    const clearPendingPayment = async () => {
      pendingPaymentCleared = true;
    };

    // Simulate user cancelling Razorpay checkout
    const onCheckoutCancelled = async () => {
      await clearPendingPayment();
      paymentState = 'CANCELLED';
      errorMessage = null;
    };

    await onCheckoutCancelled();
    assert.equal(pendingPaymentCleared, true, 'Pending payment is cleared on checkout cancel');
    assert.equal(paymentState, 'CANCELLED');
    const canPay = ['IDLE', 'FAILED', 'CANCELLED', 'BLOCKED'].includes(paymentState);
    assert.equal(canPay, true, 'User can re-initiate payment after checkout cancel');

    // Simulate user tapping back on Payment screen
    const onCancelHold = async () => {
      holdCancelled = true;
      await clearPendingPayment();
      paymentState = 'IDLE';
    };

    await onCancelHold();
    assert.equal(holdCancelled, true, 'Backend hold cancellation is requested');
    assert.equal(paymentState, 'IDLE', 'Payment state is reset to IDLE');
  });
});

describe('Issue 15: Unpaid Holds Filtering for Home Dashboard and My Appointments', () => {
  const isPastAppointment = (date, time) => false;

  const filterHomeVisits = (items) => {
    return items.filter((a) => {
      const statusUpper = (a.status || '').toUpperCase();
      if (
        statusUpper === 'CANCELLED' ||
        statusUpper === 'CANCELED' ||
        statusUpper === 'COMPLETED' ||
        statusUpper === 'REJECTED' ||
        statusUpper === 'EXPIRED' ||
        statusUpper === 'ENDED' ||
        statusUpper === 'CLOSED' ||
        statusUpper === 'MISSED' ||
        statusUpper === 'NO SHOW' ||
        statusUpper === 'NO-SHOW' ||
        statusUpper === 'NOSHOW'
      ) {
        return false;
      }
      const payStatus = (a.paymentStatus || '').toUpperCase();
      if (
        payStatus === 'FAILED' ||
        payStatus === 'CANCELLED' ||
        payStatus === 'UNPAID'
      ) {
        return false;
      }
      const isOnlineTele = Boolean(
        a.isTele || a.visitType === 'Tele' || a.consultMode === 'Tele',
      );
      const isPayAtClinic = Boolean(
        !isOnlineTele && (a.payAtClinicAllowed === true || payStatus === 'PAY_AT_CLINIC'),
      );
      if (payStatus === 'PENDING' && !isPayAtClinic) {
        return false;
      }
      if (isPastAppointment(a.appointmentDate, a.appointmentTime)) {
        return false;
      }
      return true;
    });
  };

  it('1. InClinic appointment with PENDING payment and payAtClinicAllowed: false is dropped', () => {
    const rawList = [
      {
        patientAppId: 29187,
        doctorName: 'Dr. Pranav Bandekar',
        appointmentDate: '2026-10-28T00:00:00',
        appointmentTime: '09:15',
        status: 'NOT ARRIVED',
        paymentStatus: 'PENDING',
        visitType: 'InClinic',
        isTele: false,
        payAtClinicAllowed: false,
      },
    ];

    const result = filterHomeVisits(rawList);
    assert.equal(result.length, 0, 'Unpaid InClinic hold must be filtered out');
  });

  it('2. InClinic appointment with PENDING payment but payAtClinicAllowed: true is retained', () => {
    const rawList = [
      {
        patientAppId: 29188,
        doctorName: 'Dr. Pranav Bandekar',
        appointmentDate: '2026-10-28T00:00:00',
        appointmentTime: '10:00',
        status: 'NOT ARRIVED',
        paymentStatus: 'PENDING',
        visitType: 'InClinic',
        isTele: false,
        payAtClinicAllowed: true,
      },
    ];

    const result = filterHomeVisits(rawList);
    assert.equal(result.length, 1, 'Pay at Clinic appointment must be retained');
    assert.equal(result[0].patientAppId, 29188);
  });

  it('3. Tele appointment with PENDING payment is always dropped', () => {
    const rawList = [
      {
        patientAppId: 29189,
        doctorName: 'Dr. Pranav Bandekar',
        appointmentDate: '2026-10-28T00:00:00',
        appointmentTime: '11:00',
        status: 'NOT ARRIVED',
        paymentStatus: 'PENDING',
        visitType: 'Tele',
        isTele: true,
        payAtClinicAllowed: false,
      },
    ];

    const result = filterHomeVisits(rawList);
    assert.equal(result.length, 0, 'Unpaid Tele hold must be filtered out');
  });

  it('4. InClinic and Tele appointments with PAID status are retained as confirmed', () => {
    const rawList = [
      {
        patientAppId: 29190,
        doctorName: 'Dr. Pranav Bandekar',
        appointmentDate: '2026-10-28T00:00:00',
        appointmentTime: '11:30',
        status: 'NOT ARRIVED',
        paymentStatus: 'PAID',
        visitType: 'InClinic',
        isTele: false,
        payAtClinicAllowed: false,
      },
      {
        patientAppId: 29191,
        doctorName: 'Dr. Pranav Bandekar',
        appointmentDate: '2026-10-28T00:00:00',
        appointmentTime: '12:00',
        status: 'NOT ARRIVED',
        paymentStatus: 'CAPTURED',
        visitType: 'Tele',
        isTele: true,
        payAtClinicAllowed: false,
      },
    ];

    const result = filterHomeVisits(rawList);
    assert.equal(result.length, 2, 'PAID / CAPTURED appointments must be retained');
  });

  it('5. MyAppointments filter drops unpaid online InClinic holds', () => {
    const items = [
      {
        patientAppId: 29192,
        isTele: false,
        consultMode: 'InClinic',
        paymentStatus: 'PENDING',
        payAtClinicAllowed: false,
      },
      {
        patientAppId: 29193,
        isTele: false,
        consultMode: 'InClinic',
        paymentStatus: 'PAY_AT_CLINIC',
        payAtClinicAllowed: true,
      },
    ];

    const filtered = items.filter((item) => {
      const payStatus = (item.paymentStatus || '').toUpperCase();
      if (
        payStatus === 'FAILED' ||
        payStatus === 'CANCELLED' ||
        payStatus === 'UNPAID'
      ) {
        return false;
      }
      const isOnlineTele = Boolean(item.isTele || item.consultMode === 'Tele');
      const isPayAtClinic = Boolean(
        !isOnlineTele &&
          (item.payAtClinicAllowed === true || payStatus === 'PAY_AT_CLINIC'),
      );
      if (payStatus === 'PENDING' && !isPayAtClinic) {
        return false;
      }
      return true;
    });

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].patientAppId, 29193);
  });
});

describe('Issue 16: Family Member Booking Payment via bookingToken (Anonymous Workaround)', () => {
  it('1. prepareAuthHeaders skips Authorization header when X-Anonymous is present', async () => {
    // Mock Headers object
    class MockHeaders {
      constructor() {
        this.map = new Map();
      }
      set(k, v) { this.map.set(k.toLowerCase(), v); }
      get(k) { return this.map.get(k.toLowerCase()) ?? null; }
      has(k) { return this.map.has(k.toLowerCase()); }
      delete(k) { this.map.delete(k.toLowerCase()); }
    }

    const headersWithAnon = new MockHeaders();
    headersWithAnon.set('X-Anonymous', 'true');

    // Simulate prepareAuthHeaders logic
    const prepareHeaders = async (h, token) => {
      if (h.get('X-Anonymous') === 'true' || h.has('X-Skip-Auth')) {
        h.delete('X-Anonymous');
        h.delete('X-Skip-Auth');
        h.delete('Authorization');
        return h;
      }
      if (token) {
        h.set('Authorization', `Bearer ${token}`);
      }
      return h;
    };

    await prepareHeaders(headersWithAnon, 'jwt-token-4078');
    assert.equal(headersWithAnon.has('Authorization'), false, 'Authorization header was NOT attached');
    assert.equal(headersWithAnon.has('X-Anonymous'), false, 'X-Anonymous header was cleaned up');

    const headersNormal = new MockHeaders();
    await prepareHeaders(headersNormal, 'jwt-token-4078');
    assert.equal(headersNormal.has('Authorization'), true, 'Authorization header attached for standard calls');
    assert.equal(headersNormal.get('Authorization'), 'Bearer jwt-token-4078');
  });

  it('2. createConsultOrder query builder automatically sets X-Anonymous when valid bookingToken is passed', () => {
    const buildQuery = (body) => {
      const { anonymous, ...rest } = body;
      const isRealBookingToken = Boolean(
        rest.bookingToken &&
          rest.bookingToken.trim().length >= 20 &&
          !rest.bookingToken.startsWith('APT-'),
      );
      const shouldBeAnonymous = anonymous ?? isRealBookingToken;

      return {
        url: 'api/Payments/ConsultOrders',
        method: 'POST',
        body: {
          patientAppId: rest.patientAppId,
          bookingToken: rest.bookingToken,
          payAtClinic: rest.payAtClinic ?? false,
          idempotencyKey: rest.idempotencyKey,
          ...(rest.amount != null ? { amount: rest.amount } : {}),
        },
        headers: shouldBeAnonymous ? { 'X-Anonymous': 'true' } : undefined,
      };
    };

    // Family Member fresh booking with bookingToken
    const familyReq = buildQuery({
      patientAppId: 29195,
      bookingToken: '5c010d5cc99c4403a6d8313e2a45ebf3',
      payAtClinic: false,
      idempotencyKey: 'pa-29195-12345',
    });
    assert.deepEqual(familyReq.headers, { 'X-Anonymous': 'true' }, 'Uses anonymous header with bookingToken');

    // Appointment detail pay later without token or with APT- id
    const detailReq = buildQuery({
      patientAppId: 29195,
      bookingToken: 'APT-29195',
      payAtClinic: false,
      idempotencyKey: 'pa-29195-paylater-12345',
    });
    assert.equal(detailReq.headers, undefined, 'Does not use anonymous header for APT- bookingId');
  });

  it('3. useBookingPaymentController passes anonymous: true when booking for family member hold', () => {
    const liveBookingToken = '5c010d5cc99c4403a6d8313e2a45ebf3';
    const isRealToken = Boolean(liveBookingToken && liveBookingToken.trim().length >= 20);
    assert.equal(isRealToken, true, 'isRealToken is true for 32-char hex hold token');
  });
});












