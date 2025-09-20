# ncl-calendar-cleaner-worker
A simple typescript program powered by Cloudflare Workers and KV to cleanup timetables provided by https://timetable.ncl.ac.uk

# How to use
## Timetable Website
1. Go onto the [timetable website](https://timetables.ncl.ac.uk/) and find the link beginning with webcal://
2. Replace m.ncl.ac.uk with ncl-calendar-cleaner-worker.chachy.workers.dev
3. Open/Search the replaced webcal:// URI and should work as normal in your Calendar App

## Student ID
If you know your student ID already (located on your Smartcard), you can simply copy the following link replacing the placeholder, `STUDENT_ID_HERE`, with your student ID and paste it into your browser:
webcal://ncl-calendar-cleaner-worker.chachy.workers.dev/itservice/ical/ical.php?personal=STUDENT_ID_HERE&type=C;F;H;L;P;S;T;V;W;A;SO
