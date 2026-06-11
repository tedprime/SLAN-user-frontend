import Button from "../ui/Button";

export default function CTABanner() {
  return (
    <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div
          className="bg-primary-500 rounded-xl sm:rounded-2xl 
                     px-5 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-12
                     flex flex-col lg:flex-row items-center lg:items-center 
                     justify-between gap-6 lg:gap-8"
        >
          {/* Text content */}
          <div className="text-center lg:text-left w-full lg:w-auto">
            <h3 className="font-headline font-extrabold text-white text-xl sm:text-2xl lg:text-3xl mb-2 sm:mb-3 leading-tight">
              Ready to lead with earned authority?
            </h3>
            <p className="font-body text-white/80 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Enrol and join 500
              future-focused school leaders across Nigeria.
            </p>
          </div>

          {/* CTA box */}
          <div className="flex flex-col items-center lg:items-end gap-2 sm:gap-3 w-full lg:w-auto shrink-0">
            <Button
              variant="secondary"
              size="lg"
              href="#enroll"
              className="w-full sm:w-auto sm:min-w-50 justify-center"
            >
              Enrol Now
            </Button>
            <span className="text-xs text-white/60 font-body text-center lg:text-right">
              Flexible payment plan available
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
