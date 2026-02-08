import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Brain, Shield, Terminal, Cpu, User } from 'lucide-react';
import {
  GridBackground,
  HUDContainer,
  Button3D,
  IsoCard,
  GlitchText
} from '@/components/ui/BrutalistComponents';

const Roll = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground font-mono flex flex-col relative overflow-hidden">
      <GridBackground />

      {/* HEADER */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 border-b border-white/10 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-primary">
          <Cpu className="w-5 h-5 animate-pulse" />
          <span className="font-bold tracking-widest text-sm">NEURIX_ACCESS_POINT</span>
        </div>
        <button onClick={() => navigate(-1)} className="text-xs uppercase hover:text-primary transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Abort_Sequence
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl w-full items-center">

          {/* LEFT - INTRO */}
          <div className="space-y-8">
            <div>
              <div className="inline-block border border-primary/30 bg-primary/5 px-2 py-1 mb-4">
                <span className="text-[10px] text-primary uppercase tracking-widest font-bold">System Status: Waiting for Input</span>
              </div>
              <h1 className="font-heading text-5xl md:text-7xl uppercase leading-[0.85] mb-6">
                Identity <br />
                <span className="text-primary">Initialization</span>
              </h1>
              <p className="text-muted-foreground text-lg border-l-2 border-primary pl-4 max-w-md">
                Begin cognitive optimization protocols. Select your entry vector.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                { icon: Brain, label: "Neural Mapping", desc: "Advanced cognitive profiling" },
                { icon: Shield, label: "Secure Enclave", desc: "E2E Encrypted Session Data" }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-white/10 bg-black/50">
                  <feature.icon className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-bold uppercase text-sm">{feature.label}</h3>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT - ACTIONS */}
          <IsoCard>
            <div className="p-8 space-y-8 bg-black/80">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <Terminal className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="font-heading text-xl uppercase">Entry Protocols</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Select Authorization Level</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs uppercase text-white font-bold group-hover:text-primary transition-colors">Existing Operator</span>
                    <span className="text-[10px] text-muted-foreground">ID_REQUIRED</span>
                  </div>
                  <Link to="/auth?mode=login">
                    <Button3D variant="primary" className="w-full justify-between">
                      <span>Initiate Login</span>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Button3D>
                  </Link>
                </div>

                <div className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs uppercase text-white font-bold group-hover:text-primary transition-colors">New Subject</span>
                    <span className="text-[10px] text-muted-foreground">REGISTRATION_OPEN</span>
                  </div>
                  <Link to="/auth?mode=signup">
                    <Button3D variant="outline" className="w-full justify-between">
                      <span>Create Identity</span>
                      <User className="w-4 h-4" />
                    </Button3D>
                  </Link>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-center">
                <p className="text-[10px] text-muted-foreground">
                  By proceeding, you accept the <span className="text-white hover:underline cursor-pointer">Terms_of_Engagement</span>.
                </p>
              </div>
            </div>
          </IsoCard>

        </div>
      </div>
    </div>
  );
};

export default Roll;