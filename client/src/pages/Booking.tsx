import { useState, useEffect } from 'react';
import { Calendar, User, CheckCircle, ArrowRight } from 'lucide-react';
import {
  GridBackground,
  Button3D,
  HUDContainer,
  IsoCard,
} from '@/components/ui/BrutalistComponents';

// Mock data for counsellors
const mockCounsellors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    title: 'Clinical Psychologist',
    specializations: ['Anxiety', 'Stress Management', 'CBT'],
    introduction: 'Specializing in cognitive behavioral therapy with 10+ years of experience helping people find balance.',
    availableSlots: [
      { id: 1, date: '2025-09-03', time: '10:00', duration: 30 },
      { id: 2, date: '2025-09-03', time: '14:00', duration: 30 },
      { id: 3, date: '2025-09-04', time: '11:00', duration: 30 },
      { id: 4, date: '2025-09-04', time: '15:00', duration: 30 },
    ],
    languages: ['EN', 'ES'],
    rating: 4.9,
    image: '/placeholder.svg',
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'Student Counsellor',
    specializations: ['Academic Stress', 'Career Guidance', 'Mindfulness'],
    introduction: 'Focus on helping students develop coping strategies and achieve academic success.',
    availableSlots: [
      { id: 5, date: '2025-09-03', time: '09:00', duration: 30 },
      { id: 6, date: '2025-09-03', time: '13:00', duration: 30 },
      { id: 7, date: '2025-09-04', time: '10:00', duration: 30 },
    ],
    languages: ['EN', 'ZH'],
    rating: 4.7,
    image: '/placeholder.svg',
  },
];

const availableDates = [
  '2025-09-03',
  '2025-09-04',
  '2025-09-05',
  '2025-09-06',
];

export default function Booking() {
  const [selectedCounsellor, setSelectedCounsellor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [bookingDetails, setBookingDetails] = useState({
    reason: '',
    notes: '',
  });

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [selectedDate]);

  const handleCounsellorSelect = (counsellor: any) => {
    setSelectedCounsellor(counsellor);
    setBookingStep(2);
  };

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot);
    setBookingStep(3);
  };

  const handleBookingConfirm = () => {
    setBookingStep(4);
  };

  const resetBooking = () => {
    setSelectedCounsellor(null);
    setSelectedSlot(null);
    setBookingStep(1);
    setBookingDetails({ reason: '', notes: '' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <GridBackground />

      {/* HEADER */}
      <div className="pt-24 pb-12 border-b border-border bg-background/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-widest mb-2">
                <Calendar className="w-3 h-3" />
                Find Support
              </div>
              <h1 className="font-heading text-6xl font-bold uppercase leading-[0.85] mb-4">
                Schedule <br />
                <span className="text-primary">Session</span>
              </h1>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase">
              <span>Step {bookingStep} / 4</span>
              <div className="w-32 h-2 bg-white/10">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${bookingStep * 25}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {bookingStep === 4 ? (
          // CONFIRMATION
          <div className="max-w-2xl mx-auto">
            <HUDContainer className="text-center py-12">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 border-2 border-primary flex items-center justify-center rounded-full">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
              </div>
              <h2 className="font-heading text-3xl uppercase mb-4">You're Booked</h2>
              <p className="text-muted-foreground mb-8">
                Your session with {selectedCounsellor?.name} is confirmed.
              </p>

              <div className="bg-white/5 border border-white/10 p-6 mb-8 text-left font-mono text-sm space-y-2 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">COUNSELLOR</span>
                  <span className="text-white">{selectedCounsellor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DATE</span>
                  <span className="text-white">{selectedSlot?.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TIME</span>
                  <span className="text-primary">{selectedSlot?.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LOCATION</span>
                  <span className="text-white">Secure Video Link</span>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button3D onClick={resetBooking} variant="outline">
                  New Booking
                </Button3D>
                <Button3D onClick={() => window.location.href = '/dashboard'} variant="primary">
                  Return to Dashboard
                </Button3D>
              </div>
            </HUDContainer>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-12">

            {/* LEFT SIDE - SELECTION */}
            <div className="lg:col-span-8 space-y-8">
              {bookingStep === 1 && (
                <div className="grid gap-6">
                  {mockCounsellors.map((counsellor) => (
                    <IsoCard key={counsellor.id} className="cursor-pointer group" >
                      <div className="flex flex-col md:flex-row gap-6" onClick={() => handleCounsellorSelect(counsellor)}>
                        <div className="w-24 h-24 bg-white/10 flex-shrink-0 border border-white/20 rounded-md overflow-hidden">
                          {/* Image placeholder */}
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <User className="w-8 h-8" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-heading text-2xl uppercase group-hover:text-primary transition-colors">
                              {counsellor.name}
                            </h3>
                            <span className="bg-primary text-black text-xs font-bold px-2 py-1 rounded-sm">
                              {counsellor.rating} ★
                            </span>
                          </div>
                          <p className="text-primary font-mono text-xs mb-4 uppercase">{counsellor.title}</p>
                          <p className="text-muted-foreground text-sm mb-4">{counsellor.introduction}</p>
                          <div className="flex gap-2">
                            {counsellor.specializations.map(spec => (
                              <span key={spec} className="text-[10px] uppercase border border-white/20 px-2 py-1 text-muted-foreground rounded-sm">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="self-center">
                          <Button3D variant="outline" className="w-full md:w-auto">
                            Select <ArrowRight className="w-4 h-4 ml-2" />
                          </Button3D>
                        </div>
                      </div>
                    </IsoCard>
                  ))}
                </div>
              )}

              {bookingStep === 2 && (
                <HUDContainer title="Select Best Time">
                  <div className="mb-8">
                    <h3 className="text-xs uppercase text-muted-foreground mb-4">Date Selection</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {availableDates.map((date) => (
                        <button
                          key={date}
                          onClick={() => setSelectedDate(date)}
                          className={`flex-shrink-0 px-6 py-4 border transition-all font-mono text-sm uppercase rounded-md ${selectedDate === date
                            ? 'bg-primary text-black border-primary'
                            : 'bg-black text-white border-white/20 hover:border-primary'
                            }`}
                        >
                          {date}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs uppercase text-muted-foreground mb-4">Available Times</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedCounsellor?.availableSlots
                        .filter((slot: any) => slot.date === selectedDate)
                        .map((slot: any) => (
                          <button
                            key={slot.id}
                            onClick={() => handleSlotSelect(slot)}
                            className={`py-4 border font-mono text-lg transition-all rounded-md ${selectedSlot?.id === slot.id
                              ? 'bg-white text-black border-white'
                              : 'bg-black text-white border-white/20 hover:border-primary hover:text-primary'
                              }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                    </div>
                  </div>
                </HUDContainer>
              )}

              {bookingStep === 3 && (
                <HUDContainer title="Session Details">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase text-muted-foreground">What would you like to focus on?</label>
                      <select
                        className="w-full bg-black border border-border h-12 px-4 font-mono text-white focus:border-primary focus:outline-none rounded-md"
                        value={bookingDetails.reason}
                        onChange={(e) => setBookingDetails({ ...bookingDetails, reason: e.target.value })}
                      >
                        <option value="">Select a topic...</option>
                        <option value="anxiety">Anxiety & Stress</option>
                        <option value="performance">Focus & Performance</option>
                        <option value="stress">General Support</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase text-muted-foreground">Anything else to share?</label>
                      <textarea
                        className="w-full bg-black border border-border p-4 font-mono text-white focus:border-primary focus:outline-none min-h-[150px] rounded-md"
                        placeholder="Feel free to share context or specific questions..."
                        value={bookingDetails.notes}
                        onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button3D onClick={handleBookingConfirm} variant="primary">
                        Confirm Booking
                      </Button3D>
                    </div>
                  </div>
                </HUDContainer>
              )}
            </div>

            {/* RIGHT SIDE - SUMMARY */}
            <div className="lg:col-span-4">
              <HUDContainer title="Session Summary" className="sticky top-24">
                {selectedCounsellor ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-border pb-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full" />
                      <div>
                        <div className="font-heading uppercase text-lg">{selectedCounsellor.name}</div>
                        <div className="text-primary text-xs font-mono">{selectedCounsellor.title}</div>
                      </div>
                    </div>

                    <div className="space-y-2 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">DATE</span>
                        <span className="text-white">{selectedDate || '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">TIME</span>
                        <span className="text-white">{selectedSlot?.time || '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">DURATION</span>
                        <span className="text-white">30 MIN</span>
                      </div>
                    </div>

                    {bookingStep > 1 && (
                      <button
                        onClick={() => setBookingStep(bookingStep - 1)}
                        className="w-full py-2 border border-white/10 hover:bg-white/5 text-xs uppercase font-mono transition-colors rounded-sm"
                      >
                        Modify
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground font-mono text-xs">
                    <div className="mb-2">Select a counsellor to begin</div>
                    <div className="animate-pulse">_</div>
                  </div>
                )}
              </HUDContainer>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}