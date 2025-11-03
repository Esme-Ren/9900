import { jsPDF } from 'jspdf';
import SDGGoal1 from '../Assets/SDGTypes/SDGGoal1.png'
import SDGGoal2 from '../Assets/SDGTypes/SDGGoal2.png'
import SDGGoal3 from '../Assets/SDGTypes/SDGGoal3.png'
import SDGGoal4 from '../Assets/SDGTypes/SDGGoal4.png'
import SDGGoal5 from '../Assets/SDGTypes/SDGGoal5.png'
import SDGGoal6 from '../Assets/SDGTypes/SDGGoal6.png'
import SDGGoal7 from '../Assets/SDGTypes/SDGGoal7.png'
import SDGGoal8 from '../Assets/SDGTypes/SDGGoal8.png'
import SDGGoal9 from '../Assets/SDGTypes/SDGGoal9.png'
import SDGGoal10 from '../Assets/SDGTypes/SDGGoal10.png'
import SDGGoal11 from '../Assets/SDGTypes/SDGGoal11.png'
import SDGGoal12 from '../Assets/SDGTypes/SDGGoal12.png'
import SDGGoal13 from '../Assets/SDGTypes/SDGGoal13.png'
import SDGGoal14 from '../Assets/SDGTypes/SDGGoal14.png'
import SDGGoal15 from '../Assets/SDGTypes/SDGGoal15.png'
import SDGGoal16 from '../Assets/SDGTypes/SDGGoal16.png'
import SDGGoal17 from '../Assets/SDGTypes/SDGGoal17.png'
import SnakeBackground from '../Assets/SnakeBackground.png'

const sdgGoal = (goalNumber: string) => {
  switch (goalNumber) {
    case '1': return SDGGoal1
    case '2': return SDGGoal2
    case '3': return SDGGoal3
    case '4': return SDGGoal4
    case '5': return SDGGoal5
    case '6': return SDGGoal6
    case '7': return SDGGoal7
    case '8': return SDGGoal8
    case '9': return SDGGoal9
    case '10': return SDGGoal10
    case '11': return SDGGoal11
    case '12': return SDGGoal12
    case '13': return SDGGoal13
    case '14': return SDGGoal14
    case '15': return SDGGoal15
    case '16': return SDGGoal16
    case '17': return SDGGoal17
  }
}

const DownloadForm = async (formData: any) => {

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const padding = 1;

  const dynamicBoxX = 20;
  const dynamicBoxY = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('IMPACT DESIGN ANALYSIS', 101, dynamicBoxY);
  
  doc.setFontSize(12);
  
  const goalNumbers = formData.plan_content.SDGs
                        .map((sdg: string) => sdg.split(' ')[1]
                        .replace(':', ''))
                        .slice(0, 3);

  let x = 15;
  for (const goalNumber of goalNumbers) {
    const image = sdgGoal(goalNumber);
    if (image) {
      doc.addImage(image, 'PNG', 271, x, 8, 8);
      x += 9;
    }
  }

  // Proj name + designer
  const labelRow1Y = dynamicBoxY + 10;
  const projectNameX = dynamicBoxX + padding;
  const designersX = projectNameX + 90;

  doc.setFont('helvetica', 'bold');
  doc.text(formData.impact_project_name, projectNameX, labelRow1Y);
  doc.setFont('helvetica', 'normal');
  doc.text('Designed by: ' + formData.name_of_designers, designersX, labelRow1Y);

  // Role + Date
  const labelRow2Y = labelRow1Y + 6;
  const roleX = projectNameX;
  const dateX = designersX;
  doc.text('Role and Affiliation: ' + formData.plan_content.role, roleX, labelRow2Y);
  doc.text('Date: ' + (new Date(formData.updated_at)).toLocaleDateString('en-US'), dateX, labelRow2Y);

  // Purple Box (main challenge to solve + proj description)
  const purpleBoxX = roleX;
  const purpleBoxY = labelRow2Y + 10;

  doc.setFillColor(84, 70, 140);
  doc.rect(purpleBoxX, purpleBoxY, 50, 140, 'F');

  // Main Challenge to Solve
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);

  doc.text('Main Challenge to Solve', purpleBoxX + 5, purpleBoxY + 10, {
    maxWidth: 40,
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(formData.plan_content.challenge, purpleBoxX + 5, purpleBoxY + 20, {
    maxWidth: 40,
  });

  // Project Description
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);

  doc.text('Project Description', purpleBoxX + 5, purpleBoxY + 70);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(formData.description, purpleBoxX + 5, purpleBoxY + 80, {
    maxWidth: 49,
  });

  // Forest Box (Impact importance)
  const forestBoxX = roleX + 52;
  const forestBoxY = labelRow2Y + 10;

  doc.setFillColor(70, 100, 3);
  doc.rect(forestBoxX, forestBoxY, 50, 69, 'F');

  // Impact Importance
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);

  doc.text('Impact importance', forestBoxX + 5, forestBoxY + 10, {
    maxWidth: 40,
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(formData.plan_content.importance, forestBoxX + 5, forestBoxY + 20, {
    maxWidth: 40,
  });

  // Blue Box (Existing example)
  const blueBoxX = roleX + 52;
  const blueBoxY = labelRow2Y + 81;

  doc.setFillColor(9, 139, 168);
  doc.rect(blueBoxX, blueBoxY, 50, 69, 'F');

  // Existing Example
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);

  doc.text('Existing Example', blueBoxX + 5, blueBoxY + 10, {
    maxWidth: 40,
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(formData.plan_content.example, blueBoxX + 5, blueBoxY + 20, {
    maxWidth: 40,
  });

  // Crimson Box (Resources or partnerships + sth lol)
  const crimsonBoxX = roleX + 104;
  const crimsonBoxY = labelRow2Y + 10;

  doc.setFillColor(153, 27, 27);
  doc.rect(crimsonBoxX, crimsonBoxY, 50, 140, 'F');

  // Resources or partnerships
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);

  doc.text('Resources or partnerships', crimsonBoxX + 5, crimsonBoxY + 10, {
    maxWidth: 40,
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(formData.plan_content.resources, crimsonBoxX + 5, crimsonBoxY + 20, {
    maxWidth: 40,
  });

  // Pink Box (Resources or partnerships + sth lol)
  const pinkBoxX = roleX + 156;
  const pinkBoxY = labelRow2Y + 10;

  doc.setFillColor(200, 184, 212);
  doc.rect(pinkBoxX, pinkBoxY, 50, 140, 'F');

  // Skills and capabilities 
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);

  doc.text('Impact Avenues', pinkBoxX + 5, pinkBoxY + 10, {
    maxWidth: 40,
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(formData.plan_content.impact, pinkBoxX + 5, pinkBoxY + 20, {
    maxWidth: 40,
  });

  // Cyan Box (Resources or partnerships + sth lol)
  const cyanBoxX = roleX + 208;
  const cyanBoxY = labelRow2Y + 10;

  doc.setFillColor(0, 139, 139);
  doc.rect(cyanBoxX, cyanBoxY, 50, 140, 'F');

  // Risk and mitigation
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);

  doc.text('Impact Avenues', cyanBoxX + 5, cyanBoxY + 10, {
    maxWidth: 40,
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(formData.plan_content.mitigation, cyanBoxX + 5, cyanBoxY + 20, {
    maxWidth: 40,
  });

  // Second page
  doc.addPage()
  doc.addImage(SnakeBackground, 'PNG', 0, 35, 297, 140);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('IMPACT IMPLEMENTATION ROADMAP', 80, dynamicBoxY);

  doc.setFont('helvetica', 'bold');
  doc.text('Step 1', 80, 47);
  doc.text('Step 2', 130, 47);
  doc.text('Step 3', 180, 47);
  doc.text('Step 4', 90, 107);
  doc.text('Step 5', 140, 107);
  doc.text('Step 6', 190, 107);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  doc.text(formData.plan_content.steps['input1'], 75, 65, {
    maxWidth: 30,
  });
  doc.text(formData.plan_content.steps['input2'], 125, 65, {
    maxWidth: 30,
  });
  doc.text(formData.plan_content.steps['input3'], 175, 65, {
    maxWidth: 30,
  });
  doc.text(formData.plan_content.steps['input4'], 85, 125, {
    maxWidth: 30,
  });
  doc.text(formData.plan_content.steps['input5'], 135, 125, {
    maxWidth: 30,
  });
  doc.text(formData.plan_content.steps['input6'], 185, 125, {
    maxWidth: 30,
  });

  // Form will download
  doc.save(formData.impact_project_name + ' Form');

};

export default DownloadForm;
