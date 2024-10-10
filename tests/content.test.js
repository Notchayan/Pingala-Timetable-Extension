/**
 * @jest-environment jsdom
 */

import { getPersonalData, getPersonalData1 } from './content'; // Adjust path to your content.js file

describe('Content functions', () => {
    let bodyContent;

    beforeEach(() => {
        // Set up mock DOM structure
        bodyContent = `
            <div class="pull-left image">
                <img src="profile.jpg" />
            </div>
            <div class="pull-left info">
                <p>John Doe</p>
            </div>
            <div class="content-header">
                <div class="breadcrumb">
                    <li>Semester: 2023/24</li>
                </div>
            </div>
            <div class="col-lg-6">
                <div>
                    <div>Applied Credits :</div>
                    <div>24</div>
                </div>
                <div>
                    <div>Roll No. :</div>
                    <div>220309</div>
                </div>
                <div>
                    <div>Programme :</div>
                    <div>B.Tech</div>
                </div>
                <div>
                    <div>Department :</div>
                    <div>CSE</div>
                </div>
            </div>
        `;

        // Set the HTML content of the document body
        document.body.innerHTML = bodyContent;
    });

    it('should retrieve personal data correctly', () => {
        const result = getPersonalData();
        expect(result.dp).toBe('profile.jpg');
        expect(result.name).toBe('John Doe');
        expect(result.roll_no).toBe('220309');
        expect(result.programme).toBe('B.Tech');
        expect(result.dept).toBe('CSE');
        expect(result.appliedCredits).toBe('24');
        expect(result.sem).toBe('2023-24');
    });

    it('should retrieve personal data from a different structure', () => {
        const mockContent = `
            <div id="formcontent">
                <div class="col-sm-4 col-lg-8 col-xs-4 col-md-4">220309</div>
                <div class="col-sm-4 col-lg-8 col-xs-4 col-md-4">B.Tech</div>
                <div class="col-sm-4 col-lg-8 col-xs-4 col-md-4">CSE</div>
                <div class="col-sm-4 col-lg-8 col-xs-4 col-md-4">24</div>
                <div class="col-sm-4 col-lg-8 col-xs-4 col-md-4">2023/24</div>
            </div>
        `;

        // Set the HTML content of the document body
        document.body.innerHTML = mockContent;

        const result = getPersonalData1();
        expect(result.dp).toBe('profile.jpg');
        expect(result.name).toBe('John Doe');
        expect(result.roll_no).toBe('220309');
        expect(result.programme).toBe('B.Tech');
        expect(result.dept).toBe('CSE');
        expect(result.appliedCredits).toBe('24');
        expect(result.sem).toBe('2023/24');
    });
});

