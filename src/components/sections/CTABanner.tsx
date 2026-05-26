import Button from "../ui/Button";

export default function CTABanner() {
  return (
    <section className="py-6 px-6">
      <div className="max-w-7xl mx-auto">
        <div
          className="bg-primary-500 rounded-2xl px-8 md:px-12 py-10 
                     flex flex-col md:flex-row items-start md:items-center 
                     justify-between gap-6"
        >
          <div>
            <h3 className="font-headline font-800 text-white text-2xl md:text-3xl mb-2">
              Ready to lead with earned authority?
            </h3>
            <p className="font-body text-white/80 text-sm md:text-base max-w-xl">
              Enrol in the upcoming April 2026 Cohort and join 500
              future-focused school leaders across Nigeria.
            </p>
          </div>

          {/* CTA box */}
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <Button
              variant="secondary"
              size="lg"
              href="#enroll"
              className="min-w-50 justify-center"
            >
              Enrol Now
            </Button>
            <span className="text-xs text-white/60 font-body">
              Flexible 3-month payment plan available
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}